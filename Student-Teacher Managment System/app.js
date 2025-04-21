// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBrSpknlr-JMIEQYXxg4KB8Q1mHACPrmD0",
    authDomain: "student-35380.firebaseapp.com",
    databaseURL: "https://student-35380-default-rtdb.firebaseio.com",
    projectId: "student-35380",
    storageBucket: "student-35380.firebasestorage.app",
    messagingSenderId: "297243610125",
    appId: "1:297243610125:web:6e73e7fd54f4734b5d9944",
    measurementId: "G-7R4TYQ55CS"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();
  
  // Show Tabs
  function showTab(id) {
    document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
    document.getElementById(id).style.display = "block";
  }
  
  // Register
  function register() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-pass").value;
  
    auth.createUserWithEmailAndPassword(email, pass)
      .then(cred => {
        return db.ref("student/users/" + cred.user.uid).set({
          name: name,
          email: email,
          role: "pending" // Will be changed to "student" after admin approval
        });
      })
      .then(() => {
        alert("Registered successfully. Wait for admin approval.");
        window.location.href = "index.html";
      })
      .catch(error => {
        alert(error.message);
      });
  }
  // RedirectbyRole
  function redirectByRole() {
    const user = auth.currentUser;
    if (!user) return;
  
    db.ref("student/users/" + user.uid).once("value")
      .then(snapshot => {
        const data = snapshot.val();
        if (!data || !data.role) {
          alert("Role not assigned. Contact admin.");
          return;
        }
  
        switch (data.role) {
          case "student":
            window.location.href = "student.html";
            break;
          case "teacher":
            window.location.href = "teacher.html";
            break;
          case "admin":
            window.location.href = "admin.html";
            break;
          case "pending":
            alert("Your account is pending approval.");
            break;
          default:
            alert("Unknown role: " + data.role);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error fetching user data.");
      });
  }
  
  
  // Login
  
  function login() {
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-pass").value;
  
    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        redirectByRole();  // 👈 Add this
      })
      .catch(error => alert(error.message));
  }
  
  // Book Appointment
  function bookAppointment() {
    const teacher = document.getElementById("teacher-name").value;
    const date = document.getElementById("appointment-date").value;
    const message = document.getElementById("message").value;
    const user = auth.currentUser;
  
    if (!user) {
      alert("Please log in first.");
      return;
    }
  
    const appointment = {
      studentId: user.uid,
      teacher,
      date,
      message,
      status: "Pending"
    };
  
    db.ref("student/appointments").push(appointment)
    .then(() => alert("Appointment booked successfully!"))
    .catch(err => alert(err.message));
}
  