const { PrismaClient } = require("@prisma/client");
const NonPaymentCrawler = require("./crawl-nonpayment");

const prisma = new PrismaClient();

async function testCrawler() {
  console.log("=== 비급여 크롤링 테스트 시작 ===\n");

  try {
    // 1. 데이터베이스 연결 테스트
    console.log("1. 데이터베이스 연결 테스트...");
    await prisma.$connect();
    console.log("✅ 데이터베이스 연결 성공\n");

    // 2. 테스트할 병원 수 확인
    const totalHospitals = await prisma.hospital.count();
    console.log(`2. 전체 병원 수: ${totalHospitals}개\n`);

    // 3. 기존 비급여 데이터 확인
    const existingCount = await prisma.hospitalNonPaymentItem.count();
    console.log(`3. 기존 비급여 데이터: ${existingCount}개\n`);

    // 4. 테스트용 병원 5개 선택
    console.log("4. 테스트용 병원 5개 선택...");
    const testHospitals = await prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        encryptedCode: true,
      },
      take: 5,
      orderBy: { id: "asc" },
    });

    console.log("선택된 병원들:");
    testHospitals.forEach((hospital, index) => {
      console.log(`  ${index + 1}. ${hospital.name} (ID: ${hospital.id})`);
    });
    console.log();

    // 5. 크롤러 테스트 실행
    console.log("5. 크롤링 테스트 실행...");
    const crawler = new NonPaymentCrawler();
    
    let totalProcessed = 0;
    for (const hospital of testHospitals) {
      console.log(`\n처리 중: ${hospital.name}`);
      
      const items = await crawler.fetchNonPaymentData(hospital.encryptedCode);
      if (items && items.length > 0) {
        const savedCount = await crawler.addToSaveQueue(
          hospital.id,
          hospital.encryptedCode,
          items
        );
        console.log(`  ✅ ${savedCount}개 아이템 큐에 추가`);
        totalProcessed += savedCount;
      } else {
        console.log(`  ⚠️  데이터 없음`);
      }
    }

    // 6. 큐의 데이터를 DB에 저장
    console.log(`\n6. 큐의 데이터 저장 중... (총 ${totalProcessed}개)`);
    await crawler.flushSaveQueue();

    // 7. 저장 결과 확인
    console.log("\n7. 저장 결과 확인...");
    const newCount = await prisma.hospitalNonPaymentItem.count();
    const addedCount = newCount - existingCount;
    
    console.log(`기존 데이터: ${existingCount}개`);
    console.log(`현재 데이터: ${newCount}개`);
    console.log(`추가된 데이터: ${addedCount}개`);

    // 8. 저장된 데이터 샘플 확인
    console.log("\n8. 저장된 데이터 샘플 (최근 5개):");
    const sampleData = await prisma.hospitalNonPaymentItem.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: {
        hospital: {
          select: { name: true }
        }
      }
    });

    sampleData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.hospital.name}`);
      console.log(`     항목: ${item.treatmentName}`);
      console.log(`     금액: ${item.amount?.toLocaleString()}원`);
      console.log(`     분류: ${item.category}`);
      console.log();
    });

    console.log("✅ 테스트 완료! 크롤링과 저장이 정상적으로 작동합니다.");

  } catch (error) {
    console.error("❌ 테스트 실패:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  testCrawler().catch(console.error);
}

module.exports = testCrawler;