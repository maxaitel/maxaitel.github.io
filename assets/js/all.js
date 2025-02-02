let counter = 0;
let Title = 'aximoo';
let direction = true;
aniTitle = setInterval(function () {
    if (counter == Title.length) direction = false;
    if (counter == false) direction = true;
    counter = (direction == true) ? ++counter : --counter;
    newtitle = (counter == 0) ? "" : Title.slice(0, counter);
    document.title =  'm' + newtitle;
}, 400)

function off() {
    document.getElementById("overlay").style.display = "none";
    document.querySelector(".nav").style.display = "block";
    document.getElementById('musc').play();
    document.getElementById('musc').volume = 0.5;
    document.getElementById('show-terminal').style.display = "block";
}