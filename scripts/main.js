// module aliases
const SAME = window.SAME;
const TTS = window.speechSynthesis;

console.log(SAME, TTS);

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

const speakTTS = (utterance) => {
    return new Promise((resolve) => {
        TTS.speak(utterance); utterance.addEventListener("end", resolve);
    });
};

// other audio elements
const attentionTone = new Audio("assets/attention.wav");
const tail = new Audio("data:audio/wav;base64," + btoa(SAME.Encoder.encode(null)));

// elements on the page
const button = document.getElementById("start-alarm");
const container = document.getElementById("alarm");

const title = document.getElementById("alarm-title");
const marquee = document.getElementById("alarm-marquee-text");
const invoker = document.getElementById("alarm-invoker");
const type = document.getElementById("alarm-type");

// the SAME header message
const message = {
    originator: "PEP",
    sender: "WHITEHSE",
    code: "EAN",

    region: {
        subdiv: "0",
        stateCode: "11",
        countyCode: "001"
    },

    length: 600,
    start: {
        day: 123,
        hour: 5,
        minute: 30
    }
};

// create the message for the scrolling text and the TTS
let text = "";

if (message.originator == "PEP") {
    text += "A ";
} else if (message.originator == "EAS") {
    text += "An ";
} else if (message.originator == "WXR") {
    text += "The ";
}

text += SAME.Values.originator[message.originator] + " ";

if (message.originator == "CIV") {
    text += "have issued ";
} else {
    text += "has issued ";
}

if (["ADR", "AVA", "AVW", "EAN", "EAT", "EQW"].includes(message.code)) {
    text += "an ";
} else {
    text += "a ";
}

text += SAME.Values.code[message.code] + " for the following counties: ";

text += SAME.Values.countyCode[message.region.stateCode][message.region.countyCode];
text += " " + SAME.Values.stateCode[message.region.stateCode] + ". ";

const utterance = new SpeechSynthesisUtterance(text);
const date = new Date(2023, 0, message.start.day, message.start.hour, message.start.minute);

text += "Effective Until " + date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",

    hour: "2-digit",
    minute: "2-digit",

    hour12: true,
    timeZoneName: "short"
}).replace(",", "") + ".";

text += "   " + message.sender;

// fill the text on the page
if (message.originator == "PEP" || message.originator == "EAS") {
    title.innerText = "NATIONAL ALERT";
} else {
    title.innerText = "EMERGENCY ALERT SYSTEM";
}

marquee.innerText = text;

invoker.innerText = SAME.Values.originator[message.originator];
type.innerText = SAME.Values.code[message.code];

// generate the audio
const wave = SAME.Encoder.encode(message);
const audio = new Audio("data:audio/wav;base64," + btoa(wave));

// set the voice settings
utterance.voice = getTTSVoice();

utterance.volume = 1.5;
utterance.rate = 1;
utterance.pitch = 1;

// start the simulation when the button is clicked
button.addEventListener("click", async () => {
    button.style.display = "none";
    container.style.display = "block";

    for (let iteration = 0; iteration < 3; iteration++) {
        await sleep(1);

        if (iteration == 0) {
            marquee.style.animation = "marquee 25s linear infinite";
        }

        await playAudio(audio);
    }

    await sleep(1);
    await playAudio(attentionTone);

    for (let iteration = 0; iteration < 2; iteration++) {
        await sleep(2);
        await speakTTS(utterance);
    }

    for (let iteration = 0; iteration < 3; iteration++) {
        await sleep(1);
        await playAudio(tail);
    }
});