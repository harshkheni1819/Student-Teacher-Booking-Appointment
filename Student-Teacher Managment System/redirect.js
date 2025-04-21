function redirectByRole() {
    const user = firebase.auth().currentUser;
    if (!user) return;
  
    firebase.database().ref("student/users/" + user.uid).once("value")
      .then(snapshot => {
        const role = snapshot.val().role;
        if (role === "admin") window.location.href = "admin.html";
        else if (role === "teacher") window.location.href = "teacher.html";
        else window.location.href = "student.html";
      });
  }
  