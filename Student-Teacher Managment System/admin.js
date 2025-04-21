// Firebase Config
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
  
  // ✅ Secondary App for creating teacher accounts
  const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
  
  auth.onAuthStateChanged(user => {
    if (user) {
      db.ref("student/users/" + user.uid).once("value").then(snapshot => {
        if (snapshot.val()?.role !== "admin") {
          alert("Access denied. Only admins allowed.");
          window.location.href = "index.html";
        } else {
          loadUsers();
          loadTeachers();
        }
      });
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
  
  function loadUsers() {
    const pendingDiv = document.getElementById("pending");
    const allDiv = document.getElementById("all");
    pendingDiv.innerHTML = "<h2>Pending Users</h2>";
    allDiv.innerHTML = "<h2>All Users</h2>";
  
    db.ref("student/users").once("value").then(snapshot => {
      snapshot.forEach(child => {
        const user = child.val();
        const div = document.createElement("div");
        div.className = "user-card";
        div.innerHTML = `<strong>${user.name}</strong> (${user.email}) - Role: ${user.role}`;
  
        if (user.role === "pending") {
          const approveBtn = document.createElement("button");
          approveBtn.textContent = "Approve as Student";
          approveBtn.onclick = () => {
            db.ref("student/users/" + child.key).update({ role: "student" });
            alert("Student approved");
            loadUsers();
          };
          const approveTeacherBtn = document.createElement("button");
          approveTeacherBtn.textContent = "Approve as Teacher";
          approveTeacherBtn.onclick = () => {
            db.ref("student/users/" + child.key).update({ role: "teacher" });
            alert("Teacher approved");
            loadUsers();
          };
          div.appendChild(approveBtn);
          div.appendChild(approveTeacherBtn);
          pendingDiv.appendChild(div);
        } else {
          allDiv.appendChild(div);
        }
      });
    });
  }
  
  function loadTeachers() {
    const section = document.getElementById("teachers") || document.createElement("div");
    section.id = "teachers";
    section.className = "section";
    section.innerHTML = `
      <h2>Manage Teachers</h2>
      <form id="teacherForm">
        <input type="text" id="t-name" placeholder="Name" required />
        <input type="text" id="t-dept" placeholder="Department" required />
        <input type="text" id="t-subject" placeholder="Subject" required />
        <input type="email" id="t-email" placeholder="Email" required />
        <input type="password" id="t-pass" placeholder="Password" required />
        <button type="submit">Add Teacher</button>
      </form>
      <div id="teacherList"></div>
    `;
    document.querySelector(".content").appendChild(section);
  
    document.getElementById("teacherForm").onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("t-name").value;
      const dept = document.getElementById("t-dept").value;
      const subject = document.getElementById("t-subject").value;
      const email = document.getElementById("t-email").value;
      const pass = document.getElementById("t-pass").value;
  
      // ✅ Create user via secondary app
      secondaryApp.auth().createUserWithEmailAndPassword(email, pass)
        .then(cred => {
          const uid = cred.user.uid;
          return db.ref("student/users/" + uid).set({
            name,
            email,
            department: dept,
            subject,
            role: "teacher"
          });
        })
        .then(() => {
          alert("Teacher added successfully!");
          secondaryApp.auth().signOut(); // important: clean up secondary session
          loadTeachers();
        })
        .catch(err => {
          alert("Error: " + err.message);
        });
    };
  
    const list = section.querySelector("#teacherList");
    list.innerHTML = "";
    db.ref("student/users").once("value").then(snapshot => {
      snapshot.forEach(child => {
        const t = child.val();
        if (t.role === "teacher") {
          const div = document.createElement("div");
          div.className = "user-card";
          div.innerHTML = `
            <strong>${t.name}</strong><br>
            Email: ${t.email}<br>
            Department: ${t.department}<br>
            Subject: ${t.subject}<br>
          `;
          const delBtn = document.createElement("button");
          delBtn.textContent = "Delete";
          delBtn.onclick = () => {
            db.ref("student/users/" + child.key).remove();
            alert("Teacher removed");
            loadTeachers();
          };
          const updateBtn = document.createElement("button");
          updateBtn.textContent = "Update";
          updateBtn.onclick = () => {
            const newName = prompt("Enter new name:", t.name);
            const newDept = prompt("Enter new department:", t.department);
            const newSub = prompt("Enter new subject:", t.subject);
            if (newName && newDept && newSub) {
              db.ref("student/users/" + child.key).update({
                name: newName,
                department: newDept,
                subject: newSub
              }).then(() => {
                alert("Teacher updated");
                loadTeachers();
              });
            }
          };
          div.appendChild(updateBtn);
          div.appendChild(delBtn);
          list.appendChild(div);
        }
      });
    });
  }
  