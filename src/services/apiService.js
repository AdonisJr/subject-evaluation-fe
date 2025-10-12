import axios from "axios"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification"

const toast = useToast();

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // ✅ dynamic from env
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const auth = useAuthStore()
        const token = auth?.token || localStorage.getItem("token")

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const auth = useAuthStore()
            toast.error("Session expired. Redirecting to landing page...")
            setTimeout(() => {
                auth.logout()
                window.location.href = "/" // redirect to landing
            }, 2000) // slight delay to show toast
        }
        return Promise.reject(error)
    }
)

export const fetchUsers = async () => {
    try {
        const response = await api.get('/api/users');
        console.log('Fetched users:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const fetchMyInfo = async () => {
    try {
        const response = await api.get('/api/me');
        console.log('Fetched my info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching my info:', error);
        throw error;
    }
};

// TOR Management APIs


//
// 📄 Fetch all TORs (admin only)
//
export const fetchAllTors = async () => {
    try {
        const response = await api.get('/api/tor')
        console.log('Fetched TORs:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching TORs:', error)
        throw error
    }
}

export const fetchMyTors = async () => {
    try {
        const response = await api.get('/api/fetchMyTors')
        console.log('Fetched my TORs:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching my TORs:', error)
        throw error
    }
}

//
// 📤 Upload a new TOR
//
export const uploadTor = async (file) => {

    try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/api/tor', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000 // ⏳ 120 seconds for OCR requests
        })

        console.log('Uploaded TOR:', response.data)
        return response.data
    } catch (error) {
        console.error('Error uploading TOR:', error)
        throw error
    }
}

//
// 🔍 Get a specific TOR by ID
//
export const fetchTor = async (id) => {
    try {
        const response = await api.get(`/api/tor/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching TOR ${id}:`, error)
        throw error
    }
}

//
// ✏️ Update TOR status or remarks (admin only)
//
export const updateTor = async (id, payload) => {
    try {
        const response = await api.put(`/api/tor/${id}`, payload)
        console.log('Updated TOR:', response.data)
        return response.data
    } catch (error) {
        console.error('Error updating TOR:', error)
        throw error
    }
}

//
// ❌ Delete a TOR (user/admin)
//
export const deleteTor = async (id) => {
    try {
        const response = await api.delete(`/api/tor/${id}`)
        console.log('Deleted TOR:', response.data)
        return response.data
    } catch (error) {
        console.error('Error deleting TOR:', error)
        throw error
    }
}


/**
 * Fetch all courses
 */
export const fetchAllCourses = async () => {
    try {
        const response = await api.get('/api/courses')
        console.log('Fetched Courses:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching courses:', error)
        throw error
    }
}

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
    try {
        const response = await api.post('/api/courses', courseData)
        console.log('Created Course:', response.data)
        return response.data
    } catch (error) {
        console.error('Error creating course:', error)
        throw error
    }
}

/**
 * Update a course by ID
 */
export const updateCourse = async (id, courseData) => {
    try {
        const response = await api.put(`/api/courses/${id}`, courseData)
        console.log('Updated Course:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error updating course ID ${id}:`, error)
        throw error
    }
}

/**
 * Delete a course by ID
 */
export const deleteCourse = async (id) => {
    try {
        const response = await api.delete(`/api/courses/${id}`)
        console.log('Deleted Course:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error deleting course ID ${id}:`, error)
        throw error
    }
}


/**
 * Fetch all curriculums
 */
export const fetchAllCurriculums = async () => {
    try {
        const response = await api.get('/api/curriculums')
        console.log('Fetched Curriculums:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching curriculums:', error)
        throw error
    }
}

/**
 * Create a new curriculum
 */
export const createCurriculum = async (curriculumData) => {
    try {
        const response = await api.post('/api/curriculums', curriculumData)
        console.log('Created Curriculum:', response.data)
        return response.data
    } catch (error) {
        console.error('Error creating curriculum:', error)
        throw error
    }
}

/**
 * Update an existing curriculum
 */
export const updateCurriculum = async (id, curriculumData) => {
    try {
        const response = await api.put(`/api/curriculums/${id}`, curriculumData)
        console.log('Updated Curriculum:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error updating curriculum ID ${id}:`, error)
        throw error
    }
}

/**
 * Delete a curriculum
 */
export const deleteCurriculum = async (id) => {
    try {
        const response = await api.delete(`/api/curriculums/${id}`)
        console.log('Deleted Curriculum:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error deleting curriculum ID ${id}:`, error)
        throw error
    }
}

/**
 * Fetch curriculums by course ID
 */
export const fetchCurriculumsByCourse = async (courseId) => {
    try {
        const response = await api.get(`/api/curriculums/course/${courseId}`)
        console.log(`Fetched Curriculums for Course ${courseId}:`, response.data)
        return response.data
    } catch (error) {
        console.error(`Error fetching curriculums for course ID ${courseId}:`, error)
        throw error
    }
}


// src/services/subjectService.js
/**
 * Fetch all subjects
 */
export const fetchAllSubjects = async () => {
    try {
        const response = await api.get('/api/subjects')
        console.log('Fetched Subjects:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching subjects:', error)
        throw error
    }
}

/**
 * Fetch subjects by curriculum ID
 */
export const fetchSubjectsByCurriculum = async (curriculumId) => {
    try {
        const response = await api.get(`/api/curriculums/${curriculumId}/subjects`)
        console.log(`Fetched Subjects for Curriculum ${curriculumId}:`, response.data)
        return response.data
    } catch (error) {
        console.error(`Error fetching subjects for curriculum ID ${curriculumId}:`, error)
        throw error
    }
}

/**
 * Create a new subject
 */
export const createSubject = async (subjectData) => {
    try {
        const response = await api.post('/api/subjects', subjectData)
        console.log('Created Subject:', response.data)
        return response.data
    } catch (error) {
        console.error('Error creating subject:', error)
        throw error
    }
}

/**
 * Update an existing subject
 */
export const updateSubject = async (id, subjectData) => {
    try {
        const response = await api.put(`/api/subjects/${id}`, subjectData)
        console.log('Updated Subject:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error updating subject ID ${id}:`, error)
        throw error
    }
}

/**
 * Delete a subject
 */
export const deleteSubject = async (id) => {
    try {
        const response = await api.delete(`/api/subjects/${id}`)
        console.log('Deleted Subject:', response.data)
        return response.data
    } catch (error) {
        console.error(`Error deleting subject ID ${id}:`, error)
        throw error
    }
}

/**
 * Fetch prerequisites of a subject (recursive chain)
 */
export const fetchSubjectPrerequisites = async (id) => {
    try {
        const response = await api.get(`/api/subjects/${id}/prerequisites`)
        console.log(`Fetched Prerequisites for Subject ${id}:`, response.data)
        return response.data
    } catch (error) {
        console.error(`Error fetching prerequisites for subject ID ${id}:`, error)
        throw error
    }
}



/**
 * POST GRADES
 */
export const saveGrades = async (id, grades, user_id) => {
    try {
        const response = await api.post(`/api/grades`, {
            tor_id: id,
            grades: grades
        }, {
            timeout: 120000 // ⏳ 120 seconds for OCR requests
        });
        console.log(`Processed grades ${id}:`, response.data)
        return response.data
    } catch (error) {
        console.error(`Error to process grades ${id}:`, error)
        throw error
    }
}



/**
 * Fetch prerequisites of a subject (recursive chain)
 */
export const Tesseract = async (id, curriculum_id) => {
    try {
        const response = await api.post(`/api/process-tor/${id}/${curriculum_id}`, {}, {
            timeout: 0 // ⏳ 120 seconds for OCR requests
        });
        console.log(`Processed tor ${id}:`, response.data)
        return response.data
    } catch (error) {
        console.error(`Error to process tor ${id}:`, error)
        throw error
    }
}


export default api
