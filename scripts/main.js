// module aliases
const SAME = window.SAME;
const TTS = window.speechSynthesis;

// utility functions
const sleep = (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const retrieveJSON = (path) => {
    const request = new XMLHttpRequest();

    request.open("GET", path, false);
    request.send(null);

    return JSON.parse(request.responseText);
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

// constant values for codes/names etc.
const constants = retrieveJSON("assets/constants.json");

// audio elements
const attentionTone = new Audio("assets/attention.wav");
const tail = new Audio("data:audio/wav;base64," + btoa(SAME.Encoder.encode(null)));

// elements on the page
const button = document.getElementById("start-alarm");
const container = document.getElementById("alarm");

const title = document.getElementById("alarm-title");
const marquee = document.getElementById("alarm-marquee-text");
const invoker = document.getElementById("alarm-invoker");
const type = document.getElementById("alarm-type");

// the SAME header message & the date
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

const date = new Date(
    2023,                                                   // year
    0,                                                      // month (0 since day of the year is used) 
    message.start.day,                                      // day (in this case, the day of the year)
    message.start.hour + Math.floor(message.length / 100),  // hour
    message.start.minute + (message.length % 100)           // minute
);

// create the message for the scrolling text and the TTS
let text = "";
let ttsText = "";

if (message.originator == "PEP") {
    text += "A ";
} else if (message.originator == "EAS") {
    text += "An ";
} else if (message.originator == "WXR") {
    text += "The ";
}

text += constants.originator[message.originator] + " ";

if (message.originator == "CIV") {
    text += "have issued ";
} else {
    text += "has issued ";
}

if (constants.consonantCodes.includes(message.code)) {
    text += "an ";
} else {
    text += "a ";
}

text += constants.code[message.code] + " ";
ttsText += text;

text += "for the following counties: ";
text += constants.countyCode[message.region.stateCode][message.region.countyCode];
text += " " + constants.stateCode[message.region.stateCode] + ". ";

ttsText += "for: ";
ttsText += constants.countyCode[message.region.stateCode][message.region.countyCode];
ttsText += " in " + constants.stateName[message.region.stateCode] + ", ";

const formattedDate = date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",

    hour12: true,

    timeZone: "UTC",
    timeZoneName: "short"
});
const formattedTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",

    hour12: true,

    timeZone: "UTC",
    timeZoneName: "long"
});

text += "Effective Until " + formattedDate.replace(",", "") + ".";
ttsText += "until " + formattedTime + ".";

text += "   " + message.sender;

// fill the text on the page
if (message.originator == "PEP" || message.originator == "EAS") {
    title.innerText = "NATIONAL ALERT";
} else {
    title.innerText = "EMERGENCY ALERT SYSTEM";
}

marquee.innerText = text;

invoker.innerText = constants.originator[message.originator];
type.innerText = constants.code[message.code];

// generate the audio
const wave = SAME.Encoder.encode(message);

const audio = new Audio("data:audio/wav;base64," + btoa(wave));
const utterance = new SpeechSynthesisUtterance(ttsText);

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
            marquee.style.animation = "marquee 30s linear infinite";
        }

        await playAudio(audio);
    }

    await sleep(1);
    await playAudio(attentionTone);

    await sleep(2);

    for (let iteration = 0; iteration < 2; iteration++) {
        await speakTTS(utterance);
    }

    await sleep(1);

    for (let iteration = 0; iteration < 3; iteration++) {
        await playAudio(tail);
        await sleep(0.7);
    }
});

// print the objects to the console for debugging
console.log(SAME, TTS);
console.log(constants);

console.log(text);
console.log(ttsText);