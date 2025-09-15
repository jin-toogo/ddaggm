"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Users, Award, ChevronRight, ChevronDown } from "lucide-react";

interface SimilarHospital {
  id: number;
  name: string;
  province: string;
  district: string;
  address: string;
  insurance: boolean;
  specialistCount: number;
  distanceKm: number | null;
}

interface DepartmentGroup {
  departmentCode: string;
  departmentName: string;
  currentHospitalSpecialists: number;
  similarHospitals: SimilarHospital[];
}

interface SimilarHospitalsData {
  currentHospital: {
    id: number;
    name: string;
    province: string;
    district: string;
    departments: {
      departmentCode: string;
      departmentName: string;
      specialistCount: number;
    }[];
  };
  similarHospitalsByDepartment: DepartmentGroup[];
}

interface SimilarHospitalsSectionProps {
  hospitalId: number;
}

export default function SimilarHospitalsSection({
  hospitalId,
}: SimilarHospitalsSectionProps) {
  const [data, setData] = useState<SimilarHospitalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchSimilarHospitals() {
      try {
        const response = await fetch(
          `/api/hospitals/${hospitalId}/similar-departments?limit=3`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch similar hospitals");
        }
        const result = await response.json();
        setData(result);
        // 모든 부서를 기본적으로 펼쳐진 상태로 설정
        if (result.similarHospitalsByDepartment) {
          const allDepartmentCodes = new Set<string>(
            result.similarHospitalsByDepartment.map(
              (dept: DepartmentGroup) => dept.departmentCode
            )
          );
          setExpandedDepartments(allDepartmentCodes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarHospitals();
  }, [hospitalId]);

  const toggleDepartment = (departmentCode: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentCode)) {
      newExpanded.delete(departmentCode);
    } else {
      newExpanded.add(departmentCode);
    }
    setExpandedDepartments(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">
          근처 병원 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 현재 병원의 진료과목이 없는 경우
  if (data.currentHospital.departments.length === 0) {
    return null;
  }

  // 유사 병원이 있는 진료과목이 없는 경우
  if (data.similarHospitalsByDepartment.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">진료과목</h2>
        </div>

        <div className="space-y-2">
          {data.currentHospital.departments.map((dept) => (
            <div
              key={dept.departmentCode}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-900 font-medium">
                {dept.departmentName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">근처 병원</h2>
      </div>

      <div className="space-y-4">
        {data.similarHospitalsByDepartment.map((group) => (
          <div
            key={group.departmentCode}
            className="border border-gray-200 rounded-lg"
          >
            {/* 진료과목 헤더 */}
            <button
              onClick={() => toggleDepartment(group.departmentCode)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-medium text-lg">
                    {group.departmentName}
                  </span>
                  {group.currentHospitalSpecialists > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <Award className="w-4 h-4" />
                      <span>전문의 {group.currentHospitalSpecialists}명</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>주변 {group.similarHospitals.length}곳</span>
                  {expandedDepartments.has(group.departmentCode) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            {/* 주변 병원 리스트 */}
            {expandedDepartments.has(group.departmentCode) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="space-y-3">
                  {group.similarHospitals.map((hospital) => (
                    <Link
                      key={hospital.id}
                      href={`/hospital/${hospital.id}`}
                      className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow duration-150 border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {hospital.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{hospital.district}</span>
                            {hospital.distanceKm && (
                              <span className="text-blue-600 font-medium">
                                {hospital.distanceKm}km
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {hospital.insurance && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                보험 적용
                              </span>
                            )}
                            {hospital.specialistCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Award className="w-3 h-3" />
                                <span>전문의 {hospital.specialistCount}명</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          거리는 직선 거리 기준이며, 실제 이동 거리와 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}
