# Gradex – Artificially Inteliigent Paper Evaluation System

## 1. Introduction  
Gradex is an AI-powered system designed to automate the evaluation of student answer sheets. It leverages modern web technologies and artificial intelligence to provide fast, consistent, and scalable grading for educational institutions.

## 2. Problem Statement  
Traditional examination evaluation is:
- **Time-consuming**: Manual grading of hundreds or thousands of answer sheets takes weeks  
- **Subjective**: Different evaluators may grade the same answer differently  
- **Error-prone**: Human fatigue leads to inconsistent and inaccurate evaluations  
- **Scalability issues**: Educational institutions struggle to scale their grading operations  
- **Resource-intensive**: Requires significant manual effort and oversight  

Educational institutions need an efficient, consistent, and scalable solution to evaluate student assessments without compromising on accuracy or fairness.

## 3. Proposed Solution  
**Gradex** is an intelligent automated grading and examination management system that leverages modern AI and web technologies. The system:

- **Digitizes answer sheets** by processing scanned PDFs and images  
- **Extracts content intelligently** using OCR for handwritten and printed text  
- **Evaluates answers** using AI-based semantic analysis beyond keyword matching  
- **Grades consistently** using standardized evaluation criteria  
- **Scales efficiently** to handle large volumes of submissions  
- **Provides insights** through dashboards and performance analytics  

## 4. System Architecture  
<img width="1523" height="577" alt="GradeX Architecture" src="https://github.com/user-attachments/assets/595eaca8-639e-443f-9bc8-826dabc438a4" />

Gradex follows a client-server architecture with clear separation of components:

- **Frontend**: React-based interface for users  
- **Backend**: FastAPI server for processing and API handling  
- **Database**: MongoDB for storing users, submissions, and results  
- **AI Services**: OCR (Llama 4 Maverick) and evaluation (Google Gemini)  
- **Communication**: SMTP service for OTP and notifications  

## 5. System Workflow  
<img width="1359" height="536" alt="GradeX Process Flow" src="https://github.com/user-attachments/assets/25d11c31-ad2b-4feb-9e97-a0f1f3e99cfb" />

```

1. USER SUBMISSION
   └─► Student/Instructor uploads scanned answer sheet (PDF/Image)

2. AUTHENTICATION & VALIDATION
   └─► JWT verification
   └─► Input validation (file type, size, metadata)

3. PREPROCESSING
   └─► PDF split into individual page images
   └─► Image optimization for OCR

4. OPTICAL CHARACTER RECOGNITION (OCR)
   └─► Extracts handwritten text, printed text, and diagrams
   └─► Converts visual content into structured text

5. EVALUATION
   └─► Extracted text compared with answer key
   └─► Semantic analysis using AI models
   └─► Scoring and feedback generation

6. RESULT STORAGE
   └─► Results stored in database
   └─► Linked with student and exam records

7. DELIVERY
   └─► Results displayed on dashboard
   └─► Analytics and insights generated

```

## 6. Key Features  
- **AI-Powered OCR** for handwritten and printed text  
- **Intelligent Grading** using semantic analysis  
- **Secure Authentication** using JWT and OTP  
- **Role-Based Access Control** for different users  
- **Scalable Processing** with asynchronous handling  
- **Performance Analytics Dashboard**  

## 7. Technology Stack  

- **Frontend** : React, Vite, Tailwind CSS, Axios  
- **Backend** : FastAPI, Python, PyMongo, PyMuPDF  
- **AI Services** : Llama 4 Maverick, Google Gemini 3 Flash, Google Gemini 3.1 Pro  
- **Database & Security** : MongoDB, JWT Authentication, SMTP Email Service  

## 8. Results
- Manual vs GradeX Evaluation
  > Compared lenient, normal, and strict AI evaluation modes directly against manual ground truth scores across four diverse subjects.
<img width="997" height="695" alt="manual vs GradeX evaluation" src="https://github.com/user-attachments/assets/8e105a3c-034e-4888-966e-58df67ea3816" />

- Deviation from manual correction
  > Analyze grading bias. Bars above zero indicate the AI scored higher than humans; below indicates lower. Normal mode consistently stays tightest to the baseline.
  <img width="959" height="622" alt="{1FADB461-2360-4669-B786-3F9B88DF6DE1}" src="https://github.com/user-attachments/assets/911ca1e1-0fc0-4d49-96fa-f4854a629e21" />

- Normalised Score Radar
  > Visualized the overall score profile. All subjects are scaled to percentages of their maximum marks for an apples-to-apples performance view across domains.
<img width="753" height="616" alt="{9DB36D70-DF20-40DA-89E3-AAB4F982EBB3}" src="https://github.com/user-attachments/assets/0180fa81-a838-4411-8a31-48781dd7a012" />


## 9. Future Enhancements  
- Advanced plagiarism detection 

## 10. Conclusion  
Gradex transforms exam evaluation by combining AI with modern web technologies to deliver fast, accurate, and scalable grading. It minimizes human bias, processes large volumes efficiently, and provides an intuitive, secure platform for all users. By automating assessment, educators can focus on teaching while students receive quicker, consistent feedback. Built for the future, Gradex supports institutional growth with reduced administrative effort and opens the door to enhancements like multilingual support, advanced analytics, and mobile integration.
