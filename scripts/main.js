// module aliases
const SAME = window.SAME;
const TTS = window.speechSynthesis;

// utility functions
const sleep = (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const getTTSVoice = () => {
    const voices = TTS.getVoices();

    for (const voice of voices) {
        if (voice.lang == "en-US") {
            return voice;
        }
    }
}

const playAudio = (audio) => {
    return new Promise((resolve) => {
        audio.play(); audio.addEventListener("ended", resolve);
    });
};

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
const utterance = new SpeechSynthesisUtterance("The National Weather Service has issued a tornado warning for the following counties: Cleveland, McClain, Oklahoma.");

// set the voice settings
utterance.voice = getTTSVoice();

utterance.volume = 1;
utterance.rate = 1;
utterance.pitch = 1;

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

    await sleep(2);
    await TTS.speak(utterance);
});