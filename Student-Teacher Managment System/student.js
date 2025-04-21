// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBrSpknlr-JMIEQYXxg4KB8Q1mHACPrmD0",
    authDomain: "student-35380.firebaseapp.com",
    databaseURL: "https://student-35380-default-rtdb.firebaseio.com",
    projectId: "student-35380",
    storageBucket: "student-35380.appspot.com",
    messagingSenderId: "297243610125",
    appId: "1:297243610125:web:6e73e7fd54f4734b5d9944",
    measurementId: "G-7R4TYQ55CS"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Authentication state check
auth.onAuthStateChanged(user => {
    if (user) {
        loadTeacherDropdown();  // Load teacher dropdown for appointments
    } else {
        window.location.href = "index.html";  // Redirect if not logged in
    }
});

// Logout function
function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}

// Show section
function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Search Teachers by name or subject
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const teacherResults = document.getElementById("teacherResults");

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim().toLowerCase();
        teacherResults.innerHTML = "";

        if (!query) {
            teacherResults.innerHTML = "<p>Please enter a search term.</p>";
            return;
        }

        db.ref("student/users").once("value").then(snapshot => {
            let found = false;

            snapshot.forEach(childSnapshot => {
                const user = childSnapshot.val();
                if (
                    user.role === "teacher" &&
                    (user.name?.toLowerCase().includes(query) ||
                        user.subject?.toLowerCase().includes(query))
                ) {
                    found = true;

                    const div = document.createElement("div");
                    div.className = "teacher-card";
                    div.innerHTML = `
                        <strong>${user.name}</strong><br>
                        Email: ${user.email}<br>
                        Department: ${user.department}<br>
                        Subject: ${user.subject}<br>
                    `;
                    teacherResults.appendChild(div);
                }
            });

            if (!found) {
                teacherResults.innerHTML = "<p>No matching teachers found.</p>";
            }
        });
    });
});

// Load teacher names into dropdown for appointment
function loadTeacherDropdown() {
    const teacherSelect = document.getElementById("teacherSelect");
    teacherSelect.innerHTML = ""; // Clear existing dropdown options

    db.ref("student/users").once("value").then(snapshot => {
        snapshot.forEach(child => {
            const user = child.val();
            if (user.role === "teacher") {
                const option = document.createElement("option");
                option.value = child.key;
                option.textContent = `${user.name} - ${user.subject}`;
                teacherSelect.appendChild(option);
            }
        });
    });
}

// Book Appointment
document.getElementById("appointmentForm").addEventListener("submit", e => {
    e.preventDefault();

    const teacherId = document.getElementById("teacherSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;
    const studentId = auth.currentUser.uid;

    const newAppointment = {
        studentId,
        teacherId,
        date,
        time,
        status: "pending"
    };

    // Push appointment to Firebase
    db.ref("student/appointments").push(newAppointment).then(() => {
        alert("Appointment requested!");
        document.getElementById("appointmentForm").reset(); // Reset the form
    }).catch(err => {
        alert("Error: " + err.message);
    });
});

// Send Message (you can expand this functionality as needed)
document.getElementById("messageForm").addEventListener("submit", e => {
    e.preventDefault();
    const message = document.getElementById("messageInput").value;
    const studentId = auth.currentUser.uid;

    db.ref("student/messages").push({
        from: studentId,
        message
    }).then(() => {
        alert("Message sent!");
        document.getElementById("messageForm").reset(); // Reset the form
    }).catch(err => {
        alert("Error: " + err.message);
    });
});
