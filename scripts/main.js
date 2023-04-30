// utility functions
const sleep = (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const playAudio = (audio) => {
    return new Promise((resolve) => {
        audio.play(); audio.addEventListener("ended", resolve);
    });
};

// module aliases
const SAME = window.SAME;

// other audio elements
const attentionTone = new Audio("assets/attention.wav");

// elements on the page
const button = document.getElementById("start-alarm");
const container = document.getElementById("alarm");
const marquee = document.getElementById("alarm-marquee-text");

// the SAME header message
const message = {
    originator: "PEP",
    sender: "WHITEHSE",
    code: "EAN",

    region: {
        subdiv: "0",
        stateCode: "00",
        countyCode: "000"
    },

    length: 600,
    start: {
        day: 123,
        hour: 5,
        minute: 30
    }
};

// generate the audio
const wave = SAME.Encoder.encode(message);
const audio = new Audio("data:audio/wav;base64," + btoa(wave));

// start the simulation when the button is clicked
button.addEventListener("click", async () => {
    button.style.display = "none";
    container.style.display = "block";

    for (let iteration = 0; iteration < 3; iteration++) {
        await sleep(1);

        if (iteration == 0) {
            marquee.style.animation = "marquee 15s linear infinite";
        }

        await playAudio(audio);
    }

    await sleep(1);
    await playAudio(attentionTone);

    await sleep(3);
});