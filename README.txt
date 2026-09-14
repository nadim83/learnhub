STUDYHUB FIREBASE STARTER

Files: index.html, style.css, script.js

1. Put all 3 files in one folder.
2. Open script.js.
3. Replace the firebaseConfig placeholders with the config from Firebase Console -> Project settings -> General -> Your apps -> Web app.
4. Enable Authentication -> Sign-in method -> Email/Password.
5. Create Firestore Database.
6. Run index.html with VS Code Live Server.

This starter intentionally does not use Firebase Storage. Video uses YouTube URL and PDF uses PDF URL.

Admin: register an account, then create/update users/{UID} in Firestore and set role = admin.

Firestore paths:
users/{uid}
courses/{courseId}
courses/{courseId}/lessons/{lessonId}
courses/{courseId}/lessons/{lessonId}/questions/{questionId}
courses/{courseId}/finalQuestions/{questionId}
progress/{uid_courseId}

Current foundation: Auth, roles, courses, lessons, YouTube, PDF URL, lesson quiz, 80% unlock, final exam foundation, 3 attempts, certificate.
