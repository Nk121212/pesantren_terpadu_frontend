import { API_BASE_URL } from "@/lib/api";

export interface AcademicStats {
  totalSubjects: number;
  totalGrades: number;
  totalAttendance: number;
  averageScore: number;
}

export interface SubjectFormData {
  name: string;
  description?: string;
  teacherId?: number;
}

export interface GradeFormData {
  santriId: number;
  subjectId: number;
  score: number;
  remarks?: string;
  semester: number;
  year: number;
}

export interface AttendanceFormData {
  santriId: number;
  date: string;
  status: "PRESENT" | "ABSENT" | "SICK" | "PERMITTED";
  remarks?: string;
  recordedBy?: number;
}

export interface BulkGradeData {
  santriId: number;
  subjectId: number;
  score: number;
  semester: number;
  year: number;
  remarks?: string;
}

export interface BulkAttendanceData {
  santriId: number;
  date: string;
  status: "PRESENT" | "ABSENT" | "SICK" | "PERMITTED";
  remarks?: string;
}

export const academicApi = {
  // Subjects
  async createSubject(data: SubjectFormData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/subject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create subject: ${response.statusText}`);
    }

    return response.json();
  },

  async listSubjects(params?: { skip?: number; take?: number }) {
    const token = localStorage.getItem("token");
    const query = params
      ? `?skip=${params.skip || 0}&take=${params.take || 10}`
      : "";
    const response = await fetch(`${API_BASE_URL}/academic/subject${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.statusText}`);
    }

    return response.json();
  },

  async getSubject(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/subject/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subject: ${response.statusText}`);
    }

    return response.json();
  },

  async updateSubject(id: number, data: Partial<SubjectFormData>) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/subject/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update subject: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteSubject(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/subject/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete subject: ${response.statusText}`);
    }

    return response.json();
  },

  // Grades
  async createGrade(data: GradeFormData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create grade: ${response.statusText}`);
    }

    return response.json();
  },

  async getGradesBySantri(santriId: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/academic/grades/santri/${santriId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch grades: ${response.statusText}`);
    }

    return response.json();
  },

  async getGrade(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/grade/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch grade: ${response.statusText}`);
    }

    return response.json();
  },

  async updateGrade(id: number, data: Partial<GradeFormData>) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/grade/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update grade: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteGrade(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/grade/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete grade: ${response.statusText}`);
    }

    return response.json();
  },

  // Attendance
  async createAttendance(data: AttendanceFormData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create attendance: ${response.statusText}`);
    }

    return response.json();
  },

  async getAttendanceBySantri(santriId: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/academic/attendance/santri/${santriId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.statusText}`);
    }

    return response.json();
  },

  async getAttendance(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/attendance/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.statusText}`);
    }

    return response.json();
  },

  async updateAttendance(id: number, data: Partial<AttendanceFormData>) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/attendance/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update attendance: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteAttendance(id: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/attendance/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete attendance: ${response.statusText}`);
    }

    return response.json();
  },

  // Bulk Operations
  async bulkCreateGrades(data: BulkGradeData[]) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/grade/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk create grades: ${response.statusText}`);
    }

    return response.json();
  },

  async bulkCreateAttendance(data: BulkAttendanceData[]) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/academic/attendance/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to bulk create attendance: ${response.statusText}`
      );
    }

    return response.json();
  },

  // Stats (jika ada endpoint-nya)
  async getStats() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/academic/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Fallback jika endpoint belum tersedia
        return {
          totalSubjects: 0,
          totalGrades: 0,
          totalAttendance: 0,
          averageScore: 0,
        };
      }

      return response.json();
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      return {
        totalSubjects: 0,
        totalGrades: 0,
        totalAttendance: 0,
        averageScore: 0,
      };
    }
  },
};
