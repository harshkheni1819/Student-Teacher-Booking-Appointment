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

auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Logged in UID : ", user.uid);
        loadPendingAppointments(user.uid);
        loadAllAppointments();
        loadMessages();
    } else {
        window.location.href = "index.html";
    }
});

function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Load pending appointments
function loadPendingAppointments(teacherUid) {
    const list = document.getElementById("pendingList");
    list.innerHTML = "";

    db.ref("student/appointments")
        .orderByChild("teacherId")
        .equalTo(teacherUid)
        .once("value")
        .then(snapshot => {
            console.log("Appointments for teacher:", snapshot.val());

            const data = snapshot.val();
            if (data) {
                Object.entries(data).forEach(([key, appointment]) => {
                    if (appointment.status === "pending") {
                        const div = document.createElement("div");
                        div.className = "appointment-card";
                        div.innerHTML = `
                            <p><strong>Student:</strong> ${appointment.studentId}</p>
                            <p>Date: ${appointment.date}</p>
                            <p>Time: ${appointment.time}</p>
                            <p>Status: ${appointment.status}</p>
                            <button onclick="updateStatus('${key}', 'approved')">Approve</button>
                            <button onclick="updateStatus('${key}', 'canceled')">Cancel</button>
                        `;
                        list.appendChild(div);
                    }
                });
            } else {
                list.innerHTML = "<p>No pending appointments found.</p>";
            }
        })
        .catch(err => {
            console.error("Error loading appointments:", err);
        });
}


// Load all appointments
function loadAllAppointments() {
    const teacherId = auth.currentUser.uid;
    const list = document.getElementById("allList");
    list.innerHTML = "";

    db.ref("student/appointments")
        .orderByChild("teacherId")
        .equalTo(teacherId)
        .once("value", snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    const div = document.createElement("div");
                    div.className = "appointment-card";
                    div.innerHTML = `
                        <p><strong>Student:</strong> ${data.studentId}</p>
                        <p>Date: ${data.date}</p>
                        <p>Time: ${data.time}</p>
                        <p>Status: ${data.status}</p>
                    `;
                    list.appendChild(div);
                });
            } else {
                list.innerHTML = "<p>No appointments found.</p>";
            }
        });
}

// Update status
function updateStatus(id, status) {
    db.ref("student/appointments/" + id)
        .update({ status })
        .then(() => {
            alert("Appointment " + status);
            loadPendingAppointments();
            loadAllAppointments();
        })
        .catch(err => alert("Error: " + err.message));
}

// Load messages
function loadMessages() {
    const teacherId = auth.currentUser.uid;
    const list = document.getElementById("msgList");
    list.innerHTML = "";

    db.ref("student/messages").once("value", snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const data = child.val();
                const div = document.createElement("div");
                div.className = "message-card";
                div.innerHTML = `
                    <p><strong>From:</strong> ${data.from}</p>
                    <p>${data.message}</p>
                `;
                list.appendChild(div);
            });
        } else {
            list.innerHTML = "<p>No messages found.</p>";
        }
    });
}
