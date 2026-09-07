function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    document.getElementById("response").innerText = `Command: "${command}"`;
    
    if (command.includes("chest")) window.location.href = "../../public/pages/chest.html";
    else if (command.includes("legs")) window.location.href = "../../public/pages/leg.html";
    else if (command.includes("arms") || command.includes("biceps")) window.location.href = "../../public/pages/biceps-triceps.html";
    else if (command.includes("shoulders")) window.location.href = "../../public/pages/shoulder.html";
    else document.getElementById("response").innerText += " – No matching workout found.";
  };
}
