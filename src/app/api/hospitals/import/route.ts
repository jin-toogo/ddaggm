import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { HospitalImportData } from '@/types'

function parseTimeString(timeStr?: string): string | undefined {
  if (!timeStr) return undefined
  // HHMM 형식을 HH:MM으로 변환
  if (timeStr.length === 4) {
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}:00`
  }
  return undefined
}

function convertParkingFeeRequired(value?: string): string | undefined {
  if (!value) return undefined
  return value === 'N' ? 'N' : 'Y'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hospitalData: HospitalImportData[] = body.data || body

    if (!Array.isArray(hospitalData)) {
      return NextResponse.json(
        { error: 'Data must be an array' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: [] as Array<{ index: number; error: string }>
    }

    // 배치 크기 설정 (한 번에 처리할 레코드 수)
    const batchSize = 50
    const totalBatches = Math.ceil(hospitalData.length / batchSize)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize
      const endIndex = Math.min(startIndex + batchSize, hospitalData.length)
      const batch = hospitalData.slice(startIndex, endIndex)

      try {
        // 각 배치를 트랜잭션으로 처리하고 타임아웃을 60초로 설정
        await prisma.$transaction(async (tx: any) => {
          for (let i = 0; i < batch.length; i++) {
            const data = batch[i]
            const globalIndex = startIndex + i
            
            try {
              // 병원 기본 정보 생성
              const hospital = await tx.hospital.create({
                data: {
                  encryptedCode: data.암호화요양기호,
                  name: data.base_요양기관명,
                  type: data.base_종별코드명,
                  province: data.base_시도코드명,
                  district: data.base_시군구코드명,
                  dong: data.base_읍면동 || null,
                  postalCode: data.base_우편번호 || null,
                  address: data.base_주소,
                  phone: data.base_전화번호 || null,
                  website: data.base_병원홈페이지 || null,
                  establishedDate: data.base_개설일자 || null,
                  totalDoctors: data.base_총의사수 ? parseInt(data.base_총의사수) : null,
                  latitude: data['base_좌표(Y)'] ? parseFloat(data['base_좌표(Y)']) : null,
                  longitude: data['base_좌표(X)'] ? parseFloat(data['base_좌표(X)']) : null,
                  insurance: data.insurance || false,
                }
              })

              // 위치 상세 정보 생성 (데이터가 있는 경우만)
              const hasLocationDetails = data['세부_위치_공공건물(장소)명'] || 
                                       data.세부_위치_방향 || 
                                       data.세부_위치_거리 || 
                                       data.세부_주차_가능대수 || 
                                       data['세부_주차_비용 부담여부'] || 
                                       data['세부_주차_기타 안내사항']

              if (hasLocationDetails) {
                await tx.hospitalLocationDetail.create({
                  data: {
                    hospitalId: hospital.id,
                    landmark: data['세부_위치_공공건물(장소)명'] || null,
                    direction: data.세부_위치_방향 || null,
                    distance: data.세부_위치_거리 || null,
                    parkingSpaces: data.세부_주차_가능대수 ? parseInt(data.세부_주차_가능대수) : null,
                    parkingFeeRequired: convertParkingFeeRequired(data['세부_주차_비용 부담여부']),
                    parkingNotes: data['세부_주차_기타 안내사항'] || null,
                  }
                })
              }

              // 운영시간 정보 생성 (데이터가 있는 경우만)
              const hasOperatingHours = data.세부_휴진안내_일요일 || 
                                      data.세부_휴진안내_공휴일 || 
                                      data.세부_점심시간_평일 || 
                                      data.세부_점심시간_토요일 || 
                                      data.세부_접수시간_평일 || 
                                      data.세부_접수시간_토요일 ||
                                      data.세부_진료시작시간_일요일

              if (hasOperatingHours) {
                await tx.hospitalOperatingHour.create({
                  data: {
                    hospitalId: hospital.id,
                    sundayInfo: data.세부_휴진안내_일요일 || null,
                    holidayInfo: data.세부_휴진안내_공휴일 || null,
                    lunchWeekday: data.세부_점심시간_평일 || null,
                    lunchSaturday: data.세부_점심시간_토요일 || null,
                    receptionWeekday: data.세부_접수시간_평일 || null,
                    receptionSaturday: data.세부_접수시간_토요일 || null,
                    sunStart: parseTimeString(data.세부_진료시작시간_일요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_일요일)}`) : null,
                    sunEnd: parseTimeString(data.세부_진료종료시간_일요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_일요일)}`) : null,
                    monStart: parseTimeString(data.세부_진료시작시간_월요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_월요일)}`) : null,
                    monEnd: parseTimeString(data.세부_진료종료시간_월요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_월요일)}`) : null,
                    tueStart: parseTimeString(data.세부_진료시작시간_화요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_화요일)}`) : null,
                    tueEnd: parseTimeString(data.세부_진료종료시간_화요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_화요일)}`) : null,
                    wedStart: parseTimeString(data.세부_진료시작시간_수요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_수요일)}`) : null,
                    wedEnd: parseTimeString(data.세부_진료종료시간_수요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_수요일)}`) : null,
                    thuStart: parseTimeString(data.세부_진료시작시간_목요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_목요일)}`) : null,
                    thuEnd: parseTimeString(data.세부_진료종료시간_목요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_목요일)}`) : null,
                    friStart: parseTimeString(data.세부_진료시작시간_금요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_금요일)}`) : null,
                    friEnd: parseTimeString(data.세부_진료종료시간_금요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_금요일)}`) : null,
                    satStart: parseTimeString(data.세부_진료시작시간_토요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료시작시간_토요일)}`) : null,
                    satEnd: parseTimeString(data.세부_진료종료시간_토요일) ? new Date(`1970-01-01T${parseTimeString(data.세부_진료종료시간_토요일)}`) : null,
                  }
                })
              }

              results.success++
            } catch (error) {
              results.errors.push({
                index: globalIndex,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            }
          }
        }, {
          timeout: 300000 // 60초 타임아웃
        })
      } catch (batchError) {
        // 배치 전체 실패 시 해당 배치의 모든 레코드를 에러로 처리
        for (let i = startIndex; i < endIndex; i++) {
          results.errors.push({
            index: i,
            error: batchError instanceof Error ? batchError.message : 'Batch processing failed'
          })
        }
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} records imported successfully.`,
      success: results.success,
      errors: results.errors
    })

  } catch (error) {
    console.error('Import API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}