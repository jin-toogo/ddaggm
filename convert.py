# convert_clinics.py
import json, re
from pathlib import Path

SRC = Path("한의원목록.json")

city_slug_map = {
    "서울특별시": "seoul","부산광역시": "busan","대구광역시": "daegu","인천광역시": "incheon",
    "광주광역시": "gwangju","대전광역시": "daejeon","울산광역시": "ulsan","세종특별자치시": "sejong",
    "경기도": "gyeonggi","강원특별자치도": "gangwon","강원도": "gangwon","충청북도": "chungbuk",
    "충청남도": "chungnam","전북특별자치도": "jeonbuk","전라북도": "jeonbuk","전라남도": "jeonnam",
    "경상북도": "gyeongbuk","경상남도": "gyeongnam","제주특별자치도": "jeju",
}

district_slug_map = {
    "종로구":"jongno","중구":"jung","용산구":"yongsan","성동구":"seongdong","광진구":"gwangjin",
    "동대문구":"dongdaemun","중랑구":"jungnang","성북구":"seongbuk","강북구":"gangbuk","도봉구":"dobong",
    "노원구":"nowon","은평구":"eunpyeong","서대문구":"seodaemun","마포구":"mapo","양천구":"yangcheon",
    "강서구":"gangseo","구로구":"guro","금천구":"geumcheon","영등포구":"yeongdeungpo","동작구":"dongjak",
    "관악구":"gwanak","서초구":"seocho","강남구":"gangnam","송파구":"songpa","강동구":"gangdong",
    "해운대구":"haeundae","수영구":"suyeong","연제구":"yeonje","사하구":"saha","사상구":"sasang",
    "부산진구":"busanjin","동래구":"dongnae","남구":"nam","북구":"buk","영도구":"yeongdo","중구":"jung","서구":"seo","동구":"dong"
}

def parse_address(address: str):
    toks = address.split()
    city_kor = toks[0] if toks else ""
    district_token = None
    for t in toks[1:6]:
        if t.endswith(("구","군")):
            district_token = t; break
    if district_token is None:
        for t in toks[1:6]:
            if t.endswith("시"):
                district_token = t; break
    if district_token is None:
        district_token = toks[1] if len(toks)>1 else ""
    district_kor = district_token
    city_slug = city_slug_map.get(city_kor, "unknown")
    district_slug = district_slug_map.get(district_token)
    return city_kor, city_slug, district_kor, district_slug

raw = json.loads(SRC.read_text(encoding="utf-8"))
combined, korean_only, slugs_only = [], [], []

for i, item in enumerate(raw, start=1):
    name = item.get("Name") or item.get("name") or ""
    address = item.get("address") or ""
    city_kor, city, dist_kor, dist_slug = parse_address(address)
    combined.append({
        "id": str(i),
        "name": name,
        "address": address,
        "city": city,
        "city_kor": city_kor or "unknown",
        "district": (dist_slug if dist_slug else dist_kor or "unknown"),
        "district_kor": dist_kor or "unknown",
        "status": "confirmed"
    })
    korean_only.append({
        "id": str(i),
        "name": name,
        "address": address,
        "city_kor": city_kor or "unknown",
        "district_kor": dist_kor or "unknown",
        "status": "confirmed"
    })
    slugs_only.append({
        "id": str(i),
        "name": name,
        "address": address,
        "city": city,
        "district": (dist_slug if dist_slug else dist_kor or "unknown"),
        "status": "confirmed"
    })

Path("clinics_combined.json").write_text(json.dumps(combined, ensure_ascii=False, indent=2), encoding="utf-8")
Path("clinics_korean.json").write_text(json.dumps(korean_only, ensure_ascii=False, indent=2), encoding="utf-8")
Path("clinics_slugs.json").write_text(json.dumps(slugs_only, ensure_ascii=False, indent=2), encoding="utf-8")
print("Done:", len(combined), "rows")