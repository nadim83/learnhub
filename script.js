import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB7ae8dg44g26UVnAVV7-Z9ccnXwoMbsd0",
  authDomain: "learn-app-c41dd.firebaseapp.com",
  projectId: "learn-app-c41dd",
  storageBucket: "learn-app-c41dd.firebasestorage.app",
  messagingSenderId: "1026250691442",
  appId: "1:1026250691442:web:aaff7b74db9dfbe4db03eb",
  measurementId: "G-1VK8K6Y2J3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global Variables
let currentUser = null;
let userRole = "student";
let isRegisterMode = false;
let currentMainCourses = []; // মূল কোর্সের তালিকা
let currentLessons = [];     // লেসনের তালিকা
let activeCourseId = null;
let userProgress = {};
let quizCount = 0;
let finalQuestionCount = 0;
let activeMainCourseId = null;
let currentFinalExamData = null;

// DOM Elements
const openTheoryBtn = document.getElementById("openTheoryBtn");
const theoryModal = document.getElementById("theoryModal");
const closeTheoryModal = document.getElementById("closeTheoryModal");
const modalTheoryBody = document.getElementById("modalTheoryBody");
const authContainer = document.getElementById("authContainer");
const studentDashboard = document.getElementById("studentDashboard");
const adminDashboard = document.getElementById("adminDashboard");
const userNav = document.getElementById("userNav");

const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const nameGroup = document.getElementById("nameGroup");
const roleGroup = document.getElementById("roleGroup");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userRoleSelect = document.getElementById("userRole");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleText = document.getElementById("toggleText");
const toggleAuthBtn = document.getElementById("toggleAuthBtn");

const userNameDisplay = document.getElementById("userNameDisplay");
const userRoleBadge = document.getElementById("userRoleBadge");
const logoutBtn = document.getElementById("logoutBtn");

// Student Elements
const studentCourseSelect = document.getElementById("studentCourseSelect");
const courseList = document.getElementById("courseList");
const videoPlayer = document.getElementById("videoPlayer");
const lessonTitle = document.getElementById("lessonTitle");
const lessonDesc = document.getElementById("lessonDesc");
const lessonTheoryContainer = document.getElementById("lessonTheoryContainer");
const studentQuizSection = document.getElementById("studentQuizSection");
const quizDisplayContainer = document.getElementById("quizDisplayContainer");
const completeBtn = document.getElementById("completeBtn");
const statusBadge = document.getElementById("statusBadge");
const progressBarFill = document.getElementById("progressBarFill");
const progressText = document.getElementById("progressText");

const startFinalExamBtn = document.getElementById("startFinalExamBtn");
const downloadCertBtn = document.getElementById("downloadCertBtn");
const finalExamModal = document.getElementById("finalExamModal");
const closeFinalExamModal = document.getElementById("closeFinalExamModal");
const finalQuestionsRenderArea = document.getElementById("finalQuestionsRenderArea");
const submitFinalExamBtn = document.getElementById("submitFinalExamBtn");

// Admin Elements
const newCourseTitle = document.getElementById("newCourseTitle");
const createCourseBtn = document.getElementById("createCourseBtn");
const adminMainCourseList = document.getElementById("adminMainCourseList");
const parentCourseSelect = document.getElementById("parentCourseSelect");

const addCourseForm = document.getElementById("addCourseForm");
const editCourseId = document.getElementById("editCourseId");
const courseTitle = document.getElementById("courseTitle");
const youtubeId = document.getElementById("youtubeId");
const courseTheory = document.getElementById("courseTheory");
const quizContainer = document.getElementById("quizContainer");
const addQuizBtn = document.getElementById("addQuizBtn");

const adminFormTitle = document.getElementById("adminFormTitle");
const saveCourseBtn = document.getElementById("saveCourseBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const adminCourseTableBody = document.getElementById("adminCourseTableBody");

const adminFinalExamCourseSelect = document.getElementById("adminFinalExamCourseSelect");
const finalQuestionsContainer = document.getElementById("finalQuestionsContainer");
const addFinalQuestionBtn = document.getElementById("addFinalQuestionBtn");
const saveFinalExamBtn = document.getElementById("saveFinalExamBtn");

// ==================== Theory & Exam Modal Event Listeners ====================
if (openTheoryBtn && theoryModal && closeTheoryModal) {
  openTheoryBtn.addEventListener("click", () => {
    theoryModal.classList.remove("hidden");
  });

  closeTheoryModal.addEventListener("click", () => {
    theoryModal.classList.add("hidden");
  });

  window.addEventListener("click", (e) => {
    if (e.target === theoryModal) {
      theoryModal.classList.add("hidden");
    }
  });
}

if (closeFinalExamModal && finalExamModal) {
  closeFinalExamModal.addEventListener("click", () => {
    finalExamModal.classList.add("hidden");
  });
}

// Toggle Login / Register View
if (toggleAuthBtn) {
  toggleAuthBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;

    if (isRegisterMode) {
      authTitle.textContent = "রেজিস্ট্রেশন করুন";
      nameGroup.classList.remove("hidden");
      roleGroup.classList.remove("hidden");
      authSubmitBtn.textContent = "সাইন আপ";
      toggleText.textContent = "আগে থেকেই একাউন্ট আছে?";
      toggleAuthBtn.textContent = "লগইন করুন";
    } else {
      authTitle.textContent = "লগইন করুন";
      nameGroup.classList.add("hidden");
      roleGroup.classList.add("hidden");
      authSubmitBtn.textContent = "লগইন";
      toggleText.textContent = "একাউন্ট নেই?";
      toggleAuthBtn.textContent = "রেজিস্ট্রেশন করুন";
    }
  });
}

// Authentication Handler
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("ইমেইল এবং পাসওয়ার্ড সঠিকভাব লিখুন!");
      return;
    }

    try {
      if (isRegisterMode) {
        const name = fullNameInput.value.trim();
        const role = userRoleSelect.value;
        const res = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", res.user.uid), {
          fullName: name,
          email: email,
          role: role,
          progress: {}
        });

        alert("রেজিস্ট্রেশন সফল হয়েছে!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth Error:", err.code, err.message);

      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        alert("❌ ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন! আবার চেষ্টা করুন।");
      } else if (err.code === "auth/email-already-in-use") {
        alert("⚠️ এই ইমেইল দিয়ে ইতিমধ্যেই অ্যাকাউন্ট তৈরি করা হয়েছে।");
      } else if (err.code === "auth/weak-password") {
        alert("⚠️ পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      } else {
        alert("সমস্যা হয়েছে: " + err.message);
      }
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}

// Auth State Change Monitor
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      userRole = data.role || "student";
      userProgress = data.progress || {};
      if (userNameDisplay) userNameDisplay.textContent = data.fullName || user.email;
      if (userRoleBadge) userRoleBadge.textContent = userRole.toUpperCase();
      updatePointsAndBadgeDisplay(data.points || 0);
    } else {
      if (userNameDisplay) userNameDisplay.textContent = user.email;
      if (userRoleBadge) userRoleBadge.textContent = "STUDENT";
    }

    if (authContainer) authContainer.classList.add("hidden");
    if (userNav) userNav.classList.remove("hidden");
// ২৩৫ ও ২৩৬ নম্বর লাইনের পর:
    if (authContainer) authContainer.classList.add("hidden");
    if (userNav) userNav.classList.remove("hidden");

    // 👇 এই ব্লকটিতে loadAdminAnalytics(); যুক্ত করুন 👇
    if (userRole === "admin") {
      if (adminDashboard) adminDashboard.classList.remove("hidden");
      if (studentDashboard) studentDashboard.classList.add("hidden");
      
      loadMainCourses();
      loadAdminCourses();
      loadAdminAnalytics(); // <-- এই নতুন লাইনটি এখানে বসবে
    } else {
      if (studentDashboard) studentDashboard.classList.remove("hidden");
      if (adminDashboard) adminDashboard.classList.add("hidden");
      loadStudentMainCourses();
    }
    if (userRole === "admin") {
      if (adminDashboard) adminDashboard.classList.remove("hidden");
      if (studentDashboard) studentDashboard.classList.add("hidden");
      loadMainCourses();
      loadAdminCourses();
    } else {
      if (studentDashboard) studentDashboard.classList.remove("hidden");
      if (adminDashboard) adminDashboard.classList.add("hidden");
      loadStudentMainCourses();
    }
  } else {
    currentUser = null;
    if (authContainer) authContainer.classList.remove("hidden");
    if (userNav) userNav.classList.add("hidden");
    if (studentDashboard) studentDashboard.classList.add("hidden");
    if (adminDashboard) adminDashboard.classList.add("hidden");
  }
});

// Helper: Extract YouTube Embed Link
function getYoutubeEmbedUrl(input) {
  if (!input) return "";
  let videoId = input;
  if (input.includes("v=")) {
    videoId = input.split("v=")[1].split("&")[0];
  } else if (input.includes("youtu.be/")) {
    videoId = input.split("youtu.be/")[1];
  } else if (input.includes("embed/")) {
    videoId = input.split("embed/")[1];
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

// ==================== Step 1: Main Course Management ====================
if (createCourseBtn) {
  createCourseBtn.addEventListener("click", async () => {
    const title = newCourseTitle.value.trim();
    if (!title) {
      alert("অনুগ্রহ করে কোর্সের নাম লিখুন");
      return;
    }
    try {
      await addDoc(collection(db, "main_courses"), { title: title });
      newCourseTitle.value = "";
      alert("নতুন মূল কোর্স তৈরি হয়েছে!");
      loadMainCourses();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadMainCourses() {
  const querySnapshot = await getDocs(collection(db, "main_courses"));
  currentMainCourses = [];
  if (adminMainCourseList) adminMainCourseList.innerHTML = "";
  if (parentCourseSelect) {
    parentCourseSelect.innerHTML = '<option value="">-- কোর্স সিলেক্ট করুন --</option>';
  }
  if (adminFinalExamCourseSelect) {
    adminFinalExamCourseSelect.innerHTML = '<option value="">-- কোর্স বেছে নিন --</option>';
  }

  querySnapshot.forEach((docSnap) => {
    const mainCourse = { id: docSnap.id, ...docSnap.data() };
    currentMainCourses.push(mainCourse);

    // Populate Parent Course Dropdown for Step 2 & Step 3
    if (parentCourseSelect) {
      const opt = document.createElement("option");
      opt.value = mainCourse.id;
      opt.textContent = mainCourse.title;
      parentCourseSelect.appendChild(opt);
    }

    if (adminFinalExamCourseSelect) {
      const opt = document.createElement("option");
      opt.value = mainCourse.id;
      opt.textContent = mainCourse.title;
      adminFinalExamCourseSelect.appendChild(opt);
    }

    // Populate Admin Main Course Badges
    if (adminMainCourseList) {
      const badge = document.createElement("div");
      badge.style.cssText = "background: #1e293b; padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 8px; color: #f8fafc; font-size: 14px;";
      badge.innerHTML = `
        <span><i class="fa-solid fa-book-bookmark" style="color: #10b981;"></i> ${mainCourse.title}</span>
        <button class="btn btn-slate btn-sm" onclick="editMainCourse('${mainCourse.id}', '${mainCourse.title}')" style="padding: 2px 6px; font-size: 11px;"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteMainCourse('${mainCourse.id}')" style="padding: 2px 6px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
      `;
      adminMainCourseList.appendChild(badge);
    }
  });
}

window.editMainCourse = async (id, oldTitle) => {
  const newTitle = prompt("মূল কোর্সের নতুন নাম লিখুন:", oldTitle);
  if (newTitle && newTitle.trim() !== "") {
    await updateDoc(doc(db, "main_courses", id), { title: newTitle.trim() });
    loadMainCourses();
  }
};

window.deleteMainCourse = async (id) => {
  if (confirm("আপনি কি নিশ্চিত? এই মূল কোর্স ডিলিট করলে এর অধীনে থাকা লেসনগুলোও সিলেক্ট করা যাবে না।")) {
    await deleteDoc(doc(db, "main_courses", id));
    loadMainCourses();
    loadAdminCourses();
  }
};

// ==================== Dynamic Quiz Builder Logic ====================
if (addQuizBtn) {
  addQuizBtn.addEventListener("click", () => {
    addQuizInputField();
  });
}

function addQuizInputField(data = null) {
  quizCount++;
  const id = quizCount;
  const qItem = document.createElement("div");
  qItem.className = "quiz-builder-item border p-3 mb-2 rounded bg-dark";
  qItem.id = `quiz-block-${id}`;
  qItem.style.border = "1px solid rgba(255,255,255,0.1)";
  qItem.style.marginBottom = "10px";
  qItem.style.padding = "10px";

  qItem.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
      <strong>প্রশ্ন ${id}</strong>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeQuizBlock(${id})">মুছে ফেলুন</button>
    </div>
    <input type="text" class="form-control mb-2 quiz-question" placeholder="প্রশ্ন লিখুন" value="${data ? data.question : ''}" required style="width:100%; margin-bottom:5px;">
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-bottom:5px;">
      <input type="text" class="form-control quiz-opt0" placeholder="অপশন ১" value="${data && data.options ? data.options[0] || '' : ''}" required>
      <input type="text" class="form-control quiz-opt1" placeholder="অপশন ২" value="${data && data.options ? data.options[1] || '' : ''}" required>
      <input type="text" class="form-control quiz-opt2" placeholder="অপশন ৩" value="${data && data.options ? data.options[2] || '' : ''}">
      <input type="text" class="form-control quiz-opt3" placeholder="অপশন ৪" value="${data && data.options ? data.options[3] || '' : ''}">
    </div>
    <input type="text" class="form-control quiz-answer" placeholder="সঠিক উত্তরটি হুবহু লিখুন" value="${data ? data.answer : ''}" required style="width:100%;">
  `;
  if (quizContainer) quizContainer.appendChild(qItem);
}

window.removeQuizBlock = (id) => {
  const block = document.getElementById(`quiz-block-${id}`);
  if (block) block.remove();
};

function collectQuizzesData() {
  if (!quizContainer) return [];
  const quizBlocks = quizContainer.querySelectorAll(".quiz-builder-item");
  const quizzes = [];

  quizBlocks.forEach((block) => {
    const question = block.querySelector(".quiz-question").value.trim();
    const opt0 = block.querySelector(".quiz-opt0").value.trim();
    const opt1 = block.querySelector(".quiz-opt1").value.trim();
    const opt2 = block.querySelector(".quiz-opt2").value.trim();
    const opt3 = block.querySelector(".quiz-opt3").value.trim();
    const answer = block.querySelector(".quiz-answer").value.trim();

    const options = [opt0, opt1, opt2, opt3].filter(opt => opt !== "");

    if (question && options.length >= 2 && answer) {
      quizzes.push({
        question,
        options,
        answer
      });
    }
  });

  return quizzes;
}

// ==================== Step 3: Admin Final Exam Builder ====================
if (adminFinalExamCourseSelect) {
  adminFinalExamCourseSelect.addEventListener("change", async (e) => {
    const courseId = e.target.value;
    if (!courseId) return;
    loadAdminFinalExam(courseId);
  });
}

async function loadAdminFinalExam(courseId) {
  if (!finalQuestionsContainer) return;
  finalQuestionsContainer.innerHTML = "";
  finalQuestionCount = 0;

  const docSnap = await getDoc(doc(db, "final_exams", courseId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.questions && data.questions.length > 0) {
      data.questions.forEach(q => addFinalQuestionField(q));
    }
  } else {
    addFinalQuestionField();
  }
}

if (addFinalQuestionBtn) {
  addFinalQuestionBtn.addEventListener("click", () => {
    addFinalQuestionField();
  });
}

function addFinalQuestionField(data = null) {
  finalQuestionCount++;
  const id = finalQuestionCount;
  const qItem = document.createElement("div");
  qItem.className = "final-q-block border p-3 mb-2 rounded bg-dark";
  qItem.id = `final-q-block-${id}`;
  qItem.style.border = "1px solid rgba(255,255,255,0.1)";
  qItem.style.marginBottom = "10px";
  qItem.style.padding = "10px";

  qItem.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
      <strong>ফাইনাল প্রশ্ন ${id}</strong>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeFinalQBlock(${id})">মুছে ফেলুন</button>
    </div>
    <input type="text" class="form-control mb-2 fq-question" placeholder="প্রশ্ন লিখুন" value="${data ? data.question : ''}" required style="width:100%; margin-bottom:5px;">
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-bottom:5px;">
      <input type="text" class="form-control fq-opt0" placeholder="অপশন ১" value="${data && data.options ? data.options[0] || '' : ''}" required>
      <input type="text" class="form-control fq-opt1" placeholder="অপশন ২" value="${data && data.options ? data.options[1] || '' : ''}" required>
      <input type="text" class="form-control fq-opt2" placeholder="অপশন ৩" value="${data && data.options ? data.options[2] || '' : ''}">
      <input type="text" class="form-control fq-opt3" placeholder="অপশন ৪" value="${data && data.options ? data.options[3] || '' : ''}">
    </div>
    <input type="text" class="form-control fq-answer" placeholder="সঠিক উত্তরটি হুবহু লিখুন" value="${data ? data.answer : ''}" required style="width:100%;">
  `;
  if (finalQuestionsContainer) finalQuestionsContainer.appendChild(qItem);
}

window.removeFinalQBlock = (id) => {
  const block = document.getElementById(`final-q-block-${id}`);
  if (block) block.remove();
};

if (saveFinalExamBtn) {
  saveFinalExamBtn.addEventListener("click", async () => {
    const courseId = adminFinalExamCourseSelect.value;
    if (!courseId) {
      alert("অনুগ্রহ করে একটি কোর্স বেছে নিন!");
      return;
    }

    const blocks = finalQuestionsContainer.querySelectorAll(".final-q-block");
    const questions = [];

    blocks.forEach(block => {
      const question = block.querySelector(".fq-question").value.trim();
      const opt0 = block.querySelector(".fq-opt0").value.trim();
      const opt1 = block.querySelector(".fq-opt1").value.trim();
      const opt2 = block.querySelector(".fq-opt2").value.trim();
      const opt3 = block.querySelector(".fq-opt3").value.trim();
      const answer = block.querySelector(".fq-answer").value.trim();

      const options = [opt0, opt1, opt2, opt3].filter(o => o !== "");

      if (question && options.length >= 2 && answer) {
        questions.push({ question, options, answer });
      }
    });

    try {
      await setDoc(doc(db, "final_exams", courseId), { questions });
      alert("ফাইনাল এক্সাম সফলভাবে সেভ হয়েছে!");
    } catch (err) {
      alert(err.message);
    }
  });
}

// ==================== Student View Logic ====================
async function loadStudentMainCourses() {
  if (!studentCourseSelect) return;
  const querySnapshot = await getDocs(collection(db, "main_courses"));
  studentCourseSelect.innerHTML = '<option value="">-- কোর্স বেছে নিন --</option>';

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const opt = document.createElement("option");
    opt.value = docSnap.id;
    opt.textContent = data.title;
    studentCourseSelect.appendChild(opt);
  });
}

if (studentCourseSelect) {
  studentCourseSelect.addEventListener("change", (e) => {
    activeMainCourseId = e.target.value;
    loadStudentCourses(activeMainCourseId);
  });
}

async function loadStudentCourses(mainCourseId = null) {
  if (!courseList) return;
  const querySnapshot = await getDocs(collection(db, "courses"));
  currentLessons = [];
  courseList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!mainCourseId || data.parentCourseId === mainCourseId) {
      currentLessons.push({ id: docSnap.id, ...data });
    }
  });

  if (currentLessons.length === 0) {
    courseList.innerHTML = "<p class='text-center' style='color:#94a3b8; padding: 15px;'>কোন লেসন পাওয়া যায়নি</p>";
    if (videoPlayer) videoPlayer.src = "";
    if (lessonTitle) lessonTitle.textContent = "লেসন বেছে নিন";
    if (lessonDesc) lessonDesc.textContent = "";
    if (modalTheoryBody) modalTheoryBody.textContent = "";
    if (studentQuizSection) studentQuizSection.classList.add("hidden");
    updateProgressDisplay();
    return;
  }

  currentLessons.forEach((c, index) => {
    const isDone = userProgress[c.id];
    const isUnlocked = index === 0 || userProgress[currentLessons[index - 1].id] === true;

    const item = document.createElement("div");
    item.className = `course-item ${activeCourseId === c.id ? 'active' : ''}`;
    
    item.style.cursor = isUnlocked ? "pointer" : "not-allowed";
    item.style.opacity = isUnlocked ? "1" : "0.5";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    item.innerHTML = `
      <span>${c.title}</span>
      <div>
        ${isDone ? '<i class="fa-solid fa-check-circle" style="color:#10b981"></i>' : ''}
        ${!isUnlocked ? '<i class="fa-solid fa-lock" style="color:#ef4444; margin-left:8px;"></i>' : ''}
      </div>
    `;

    item.onclick = () => {
      if (isUnlocked) {
        selectCourse(c);
      } else {
        alert("🔒 পূর্ববর্তী লেসনের কুইজে কমপক্ষে ৮০% মার্কস পেয়ে পাস করতে হবে!");
      }
    };

    courseList.appendChild(item);
  });

  updateProgressDisplay();
  if (currentLessons.length > 0) {
    selectCourse(currentLessons[0]);
  }
}

function selectCourse(course) {
  if (!course) return;
  activeCourseId = course.id;
  if (videoPlayer) videoPlayer.src = getYoutubeEmbedUrl(course.youtubeId);
  if (lessonTitle) lessonTitle.textContent = course.title;
  
  const theoryContent = course.theory || course.description || 'কোন থিওরি যুক্ত করা হয়নি।';

  // Marked.js থাকলে রেন্ডার হবে নতুবা প্লেন টেক্সট দেখাবে
  if (modalTheoryBody) {
    if (window.marked) {
      modalTheoryBody.innerHTML = marked.parse(theoryContent);
    } else {
      modalTheoryBody.textContent = theoryContent;
    }
  }

  if (lessonTheoryContainer) {
    lessonTheoryContainer.innerHTML = `
      <button id="openTheoryBtn" class="btn btn-slate mt-2" style="margin-top: 10px;">
        <i class="fa-solid fa-book-open"></i> থিওরি পড়ুন
      </button>
    `;

    const newOpenBtn = document.getElementById("openTheoryBtn");
    if (newOpenBtn && theoryModal) {
      newOpenBtn.addEventListener("click", () => {
        theoryModal.classList.remove("hidden");
      });
    }
  }

  renderStudentQuizzes(course.quizzes || []);

  const isCompleted = userProgress[course.id];
  if (statusBadge) statusBadge.textContent = isCompleted ? "সম্পন্ন হয়েছে" : "চলমান";
  if (completeBtn) completeBtn.style.display = isCompleted ? "none" : "inline-block";

  if (courseList) {
    const allItems = courseList.querySelectorAll(".course-item");
    allItems.forEach((item, index) => {
      if (currentLessons[index] && currentLessons[index].id === course.id) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}

function renderStudentQuizzes(quizzes) {
  if (!studentQuizSection || !quizDisplayContainer) return;

  if (!quizzes || quizzes.length === 0) {
    studentQuizSection.classList.add("hidden");
    quizDisplayContainer.innerHTML = "";
    return;
  }

  studentQuizSection.classList.remove("hidden");
  quizDisplayContainer.innerHTML = "";

  quizzes.forEach((q, idx) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-card p-3 mb-3 border rounded";
    qDiv.style.marginBottom = "15px";
    qDiv.style.padding = "10px";
    qDiv.style.border = "1px solid rgba(255,255,255,0.1)";

    let optionsHtml = "";
    q.options.forEach((opt) => {
      optionsHtml += `
        <label style="display:block; margin: 5px 0; cursor:pointer;">
          <input type="radio" name="quiz_opt_${idx}" value="${opt}"> ${opt}
        </label>
      `;
    });

    qDiv.innerHTML = `
      <p style="font-weight:bold; margin-bottom: 8px;">${idx + 1}. ${q.question}</p>
      <div>${optionsHtml}</div>
    `;
    quizDisplayContainer.appendChild(qDiv);
  });

  const submitQuizBtn = document.createElement("button");
submitQuizBtn.className = "btn btn-emerald mt-2";
submitQuizBtn.textContent = "কুইজ সাবমিট করুন";

// চেক করা যাক লেসনটি ইতিমধ্যে পাস করা আছে কি না
if (userProgress && userProgress[activeCourseId] === true) {
  submitQuizBtn.textContent = "✅ আপনি ইতিমধ্যে এই লেসনে পাস করেছেন";
  submitQuizBtn.disabled = true;
  submitQuizBtn.style.opacity = "0.7";
  submitQuizBtn.style.cursor = "not-allowed";
}

submitQuizBtn.onclick = async () => {
  // ডাবল প্রোটেকশন: যদি অলরেডি পাস করা থাকে তবে রিকোয়েস্ট ব্লক হবে
  if (userProgress && userProgress[activeCourseId] === true) {
    alert("আপনি ইতিমধ্যে এই কুইজে পাস করেছেন, তাই আর পরীক্ষা দিতে পারবেন না!");
    return;
  }

  let score = 0;
  quizzes.forEach((q, idx) => {
    const selected = document.querySelector(`input[name="quiz_opt_${idx}"]:checked`);
    if (selected && selected.value.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
      score++;
    }
  });

  const percentage = (score / quizzes.length) * 100;

  if (percentage >= 80) {
    // পাস করলে পয়েন্ট যোগ হবে (শুধু একবারই)
    const pointsToEarn = score + 20;
    await addPointsToUser(pointsToEarn);

    // প্রোগ্রেস আপডেট করে ট্রু করা
    userProgress[activeCourseId] = true;
    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        progress: userProgress
      });
    }

    alert(`🎉 অভিনন্দন! আপনি ${percentage.toFixed(0)}% মার্কস পেয়ে পাস করেছেন। +${pointsToEarn} পয়েন্ট যুক্ত হয়েছে!`);

    // বাটন ডিসেবল ও টেক্সট পরিবর্তন
    submitQuizBtn.textContent = "✅ আপনি ইতিমধ্যে এই লেসনে পাস করেছেন";
    submitQuizBtn.disabled = true;
    submitQuizBtn.style.opacity = "0.7";
    submitQuizBtn.style.cursor = "not-allowed";

    loadStudentCourses(studentCourseSelect ? studentCourseSelect.value : null);
  } else {
    // ৮০% এর নিচে পেলে রিটেক দেওয়ার সুযোগ থাকবে (পয়েন্ট বা প্রোগ্রেস সেভ হবে না)
    alert(`❌ আপনি পেয়েছেন ${percentage.toFixed(0)}% মার্কস। পাস করতে কমপক্ষে ৮০% লাগবে। দয়া করে আবার চেষ্টা করুন!`);
  }
};

  quizDisplayContainer.appendChild(submitQuizBtn);
}

if (completeBtn) {
  completeBtn.addEventListener("click", async () => {
    if (!activeCourseId || !currentUser) return;

    userProgress[activeCourseId] = true;
    await updateDoc(doc(db, "users", currentUser.uid), {
      progress: userProgress
    });

    loadStudentCourses(studentCourseSelect ? studentCourseSelect.value : null);
  });
}

function updateProgressDisplay() {
  const total = currentLessons.length;
  if (total === 0) {
    if (progressBarFill) progressBarFill.style.width = `0%`;
    if (progressText) progressText.textContent = `0%`;
    toggleFinalExamButton(false);
    return;
  }

  const completed = currentLessons.filter(c => userProgress[c.id]).length;
  const percent = Math.round((completed / total) * 100);

  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}%`;

  // ১০০% হলে ফাইনাল এক্সাম বোতাম আনলক হবে
  if (percent === 100) {
    toggleFinalExamButton(true);
  } else {
    toggleFinalExamButton(false);
  }
}

function toggleFinalExamButton(isUnlocked) {
  if (!startFinalExamBtn) return;
  if (isUnlocked) {
    startFinalExamBtn.disabled = false;
    startFinalExamBtn.innerHTML = `🎓 ফাইনাল এক্সাম দিন`;
    startFinalExamBtn.style.cursor = "pointer";
  } else {
    startFinalExamBtn.disabled = true;
    startFinalExamBtn.innerHTML = `🔒 ফাইনাল এক্সাম (সব লেসন শেষ করুন)`;
    startFinalExamBtn.style.cursor = "not-allowed";
  }

  // যদি ইতোমধ্যেই পরীক্ষা পাস করে থাকে তবে সার্টিফিকেট ডাউনলোডের বাটন দৃশ্যমান হবে
  if (activeMainCourseId && userProgress[`cert_${activeMainCourseId}`]) {
    if (downloadCertBtn) downloadCertBtn.classList.remove("hidden");
  } else {
    if (downloadCertBtn) downloadCertBtn.classList.add("hidden");
  }
}

// ==================== Student Final Exam Execution ====================
if (startFinalExamBtn) {
  startFinalExamBtn.addEventListener("click", async () => {
    if (!activeMainCourseId) {
      alert("একটি কোর্স নির্বাচন করুন!");
      return;
    }

    const docSnap = await getDoc(doc(db, "final_exams", activeMainCourseId));
    if (!docSnap.exists() || !docSnap.data().questions || docSnap.data().questions.length === 0) {
      alert("এই কোর্সের জন্য এখনও ফাইনাল পরীক্ষা যুক্ত করা হয়নি। শিক্ষককে জানান।");
      return;
    }

    currentFinalExamData = docSnap.data().questions;
    renderFinalExamModal(currentFinalExamData);
    if (finalExamModal) finalExamModal.classList.remove("hidden");
  });
}

function renderFinalExamModal(questions) {
  if (!finalQuestionsRenderArea) return;
  finalQuestionsRenderArea.innerHTML = "";

  questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 6px; margin-bottom: 12px;";

    let optionsHtml = "";
    q.options.forEach(opt => {
      optionsHtml += `
        <label style="display:block; margin: 4px 0; cursor:pointer;">
          <input type="radio" name="final_q_${idx}" value="${opt}"> ${opt}
        </label>
      `;
    });

    card.innerHTML = `
      <p style="font-weight:bold; color:#f8fafc; margin-bottom: 6px;">${idx + 1}. ${q.question}</p>
      <div>${optionsHtml}</div>
    `;
    finalQuestionsRenderArea.appendChild(card);
  });
}

if (submitFinalExamBtn) {
  submitFinalExamBtn.addEventListener("click", async () => {
    if (!currentFinalExamData || currentFinalExamData.length === 0) return;

    let score = 0;
    currentFinalExamData.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="final_q_${idx}"]:checked`);
      if (selected && selected.value.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        score++;
      }
    });

    const percentage = (score / currentFinalExamData.length) * 100;

    if (percentage >= 80) {
      alert(`🏆 দারুণ! আপনি ${percentage.toFixed(0)}% মার্কস পেয়ে পাস করেছেন! এখন সার্টিফিকেট ডাউনলোড করতে পারবেন।`);
      
      userProgress[`cert_${activeMainCourseId}`] = true;
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          progress: userProgress
        });
      }

      if (finalExamModal) finalExamModal.classList.add("hidden");
      if (downloadCertBtn) downloadCertBtn.classList.remove("hidden");
    } else {
      alert(`❌ আপনি পেয়েছেন ${percentage.toFixed(0)}% মার্কস। পাস করতে অন্তত ৮০% পেতে হবে। আবার চেষ্টা করুন!`);
    }
  });
}

// ==================== Certificate Download Handler ====================
if (downloadCertBtn) {
  downloadCertBtn.addEventListener("click", async () => {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const studentName = userDoc.exists() && userDoc.data().fullName ? userDoc.data().fullName : currentUser.email;

    const mainCourseDoc = currentMainCourses.find(c => c.id === activeMainCourseId);
    const courseTitle = mainCourseDoc ? mainCourseDoc.title : "DevLearn Hub Course";

    const certStudentName = document.getElementById("certStudentName");
    const certCourseName = document.getElementById("certCourseName");
    const certDate = document.getElementById("certDate");
    const certTemplate = document.getElementById("certificateTemplate");

    if (certStudentName) certStudentName.textContent = studentName;
    if (certCourseName) certCourseName.textContent = courseTitle;
    if (certDate) certDate.textContent = new Date().toLocaleDateString("bn-BD");

    if (certTemplate && window.html2pdf) {
      certTemplate.style.display = "block";
      const opt = {
        margin:       0,
        filename:     `${studentName}_Certificate.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
      };

      html2pdf().from(certTemplate).set(opt).save().then(() => {
        certTemplate.style.display = "none";
      });
    } else {
      alert("সার্টিফিকেট জেনারেটর সম্পূর্ণ লোড হয়নি। দয়া করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
    }
  });
}

// ==================== Step 2: Admin Lesson Management ====================
if (addCourseForm) {
  addCourseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editCourseId.value;
    const quizzesData = collectQuizzesData();

    const courseData = {
      parentCourseId: parentCourseSelect.value,
      title: courseTitle.value,
      youtubeId: youtubeId.value,
      theory: courseTheory.value,
      quizzes: quizzesData
    };

    try {
      if (id) {
        await updateDoc(doc(db, "courses", id), courseData);
        alert("লেসন আপডেট সফল হয়েছে!");
      } else {
        await addDoc(collection(db, "courses"), courseData);
        alert("নতুন লেসন যুক্ত হয়েছে!");
      }
      resetAdminForm();
      loadAdminCourses();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadAdminCourses() {
  if (!adminCourseTableBody) return;
  const querySnapshot = await getDocs(collection(db, "courses"));
  adminCourseTableBody.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const quizCountText = data.quizzes ? data.quizzes.length : 0;
    
    const parent = currentMainCourses.find(m => m.id === data.parentCourseId);
    const parentName = parent ? parent.title : "সাধারণ/অন্যান্য";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge" style="background:#334155;">${parentName}</span></td>
      <td>${data.title}</td>
      <td>${quizCountText} টি প্রশ্ন</td>
      <td class="action-btn-group">
        <button class="btn btn-slate btn-sm" onclick="editCourse('${docSnap.id}')">এডিট</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCourse('${docSnap.id}')">ডিলিট</button>
      </td>
    `;
    adminCourseTableBody.appendChild(tr);
  });
}
// Analytics Data & Chart JS Logic
let enrollmentChartInstance = null;
let progressChartInstance = null;

async function loadAdminAnalytics() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const mainCoursesSnap = await getDocs(collection(db, "main_courses"));
    const lessonsSnap = await getDocs(collection(db, "courses"));

    const allUsers = [];
    usersSnap.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));

    const mainCourses = [];
    mainCoursesSnap.forEach(doc => mainCourses.push({ id: doc.id, ...doc.data() }));

    const lessons = [];
    lessonsSnap.forEach(doc => lessons.push({ id: doc.id, ...doc.data() }));

    const students = allUsers.filter(u => u.role === "student" || !u.role);
    
    const totalElem = document.getElementById("totalStudentsCount");
    if (totalElem) totalElem.textContent = students.length;

    let completed = 0, inProgress = 0, notStarted = 0;

    students.forEach(s => {
      const prog = s.progress || {};
      const doneCount = Object.values(prog).filter(v => v === true).length;

      if (doneCount === 0) notStarted++;
      else if (lessons.length > 0 && doneCount >= lessons.length) completed++;
      else inProgress++;
    });

    const courseLabels = mainCourses.map(c => c.title);
    const enrollmentCounts = mainCourses.map(c => {
      return students.filter(s => s.enrolledCourseId === c.id).length;
    });

    renderEnrollmentChart(courseLabels, enrollmentCounts);
    renderProgressChart(notStarted, inProgress, completed);

  } catch (err) {
    console.error("Analytics Error:", err);
  }
}

function renderEnrollmentChart(labels, data) {
  const ctx = document.getElementById("enrollmentChart");
  if (!ctx) return;

  if (enrollmentChartInstance) enrollmentChartInstance.destroy();

  enrollmentChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["কোন কোর্স নেই"],
      datasets: [{
        label: "স্টুডেন্ট",
        data: data,
        backgroundColor: "#10b981"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#cbd5e1", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#cbd5e1", font: { size: 10 } }, grid: { color: "#334155" }, beginAtZero: true }
      }
    }
  });
}

function renderProgressChart(notStarted, inProgress, completed) {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  if (progressChartInstance) progressChartInstance.destroy();

  progressChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["শুরু করেনি", "চলমান", "পাস করেছে"],
      datasets: [{
        data: [notStarted, inProgress, completed],
        backgroundColor: ["#ef4444", "#f59e0b", "#10b981"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#f8fafc", font: { size: 11 } }, position: "bottom" }
      }
    }
  });
}
window.editCourse = async (id) => {
  const docRef = doc(db, "courses", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    editCourseId.value = id;
    if (parentCourseSelect) parentCourseSelect.value = data.parentCourseId || "";
    courseTitle.value = data.title || "";
    youtubeId.value = data.youtubeId || "";
    courseTheory.value = data.theory || data.description || "";

    if (quizContainer) quizContainer.innerHTML = "";
    quizCount = 0;
    if (data.quizzes && data.quizzes.length > 0) {
      data.quizzes.forEach((q) => addQuizInputField(q));
    }

    if (adminFormTitle) adminFormTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> লেসন এডিট করুন`;
    if (saveCourseBtn) saveCourseBtn.textContent = "আপডেট করুন";
    if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");
  }
};

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", resetAdminForm);
}

function resetAdminForm() {
  if (editCourseId) editCourseId.value = "";
  if (addCourseForm) addCourseForm.reset();
  if (quizContainer) quizContainer.innerHTML = "";
  quizCount = 0;
  if (adminFormTitle) adminFormTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> ২. কোর্সে নতুন লেসন যোগ করুন`;
  if (saveCourseBtn) saveCourseBtn.textContent = "লেসন পাবলিশ করুন";
  if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
}

window.deleteCourse = async (id) => {
  if (confirm("আপনি কি নিশ্চিত এই লেসনটি মুছে ফেলতে চান?")) {
    await deleteDoc(doc(db, "courses", id));
    loadAdminCourses();
  }
};
// ==========================================
// Gamification System Functions
// ==========================================

// ১. পয়েন্ট ডাটাবেসে যোগ করার ফাংশন
async function addPointsToUser(pointsToAdd) {
  if (!currentUser || !currentUser.uid) return;

  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentPoints = userSnap.data().points || 0;
      const newPoints = currentPoints + pointsToAdd;

      await updateDoc(userRef, { points: newPoints });
      updatePointsAndBadgeDisplay(newPoints);
    }
  } catch (error) {
    console.error("পয়েন্ট আপডেট হতে সমস্যা হয়েছে:", error);
  }
}

// ২. পয়েন্ট অনুযায়ী ব্যাজ ও UI আপডেট
function updatePointsAndBadgeDisplay(points) {
  const pointsEl = document.getElementById('userPointsDisplay');
  const badgeEl = document.getElementById('userBadgeDisplay');

  if (pointsEl) pointsEl.textContent = points;

  let badgeText = "🥉 Rookie";
  let badgeBg = "#334155";

  if (points >= 500) {
    badgeText = "🥇 Master Mind";
    badgeBg = "#854d0e";
  } else if (points >= 300) {
    badgeText = "🥈 Pro Scholar";
    badgeBg = "#475569";
  } else if (points >= 200) {
    badgeText = "🥉 Novice Learner";
    badgeBg = "#78350f";
  }

  if (badgeEl) {
    badgeEl.textContent = badgeText;
    badgeEl.style.backgroundColor = badgeBg;
  }
}

// ৩. লিডারবোর্ড লোড করার ফাংশন
async function loadLeaderboard() {
  const listContainer = document.getElementById('leaderboardList');
  if (!listContainer) return;
  
  listContainer.innerHTML = '<p style="text-align:center; color:#94a3b8;">লোড হচ্ছে...</p>';

  try {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
    const querySnapshot = await getDocs(q);

    listContainer.innerHTML = '';
    let rank = 1;

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const points = user.points || 0;
      
      let rankIcon = `#${rank}`;
      if (rank === 1) rankIcon = '🥇';
      if (rank === 2) rankIcon = '🥈';
      if (rank === 3) rankIcon = '🥉';

      let badgeName = "Rookie";
      if (points >= 500) badgeName = "Master Mind";
      else if (points >= 300) badgeName = "Pro Scholar";
      else if (points >= 200) badgeName = "Novice Learner";

      const itemHtml = `
        <li class="leaderboard-item">
          <span class="leaderboard-rank rank-${rank}">${rankIcon}</span>
          <div class="leaderboard-user">
            <span class="leaderboard-name">${user.fullName || user.email || 'User'}</span>
            <span class="leaderboard-badge">${badgeName}</span>
          </div>
          <span class="leaderboard-points">${points} PTS</span>
        </li>
      `;
      listContainer.innerHTML += itemHtml;
      rank++;
    });
  } catch (error) {
    console.error("Leaderboard Error: ", error);
    listContainer.innerHTML = '<p style="text-align:center; color:#ef4444;">লিডারবোর্ড লোড করা যায়নি।</p>';
  }
}

// ৪. লিডারবোর্ড বাটনের ইভেন্ট লিসেনার
document.getElementById('openLeaderboardBtn')?.addEventListener('click', () => {
  document.getElementById('leaderboardModal')?.classList.remove('hidden');
  loadLeaderboard();
});

document.getElementById('closeLeaderboardModal')?.addEventListener('click', () => {
  document.getElementById('leaderboardModal')?.classList.add('hidden');
});