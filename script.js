let video = document.getElementById('video');
let result = document.getElementById('result');
let model;
let lastPrediction = null;

// Diccionario de traducción de clases de objetos
const translation = {
    'person': 'persona',
    'bicycle': 'bicicleta',
    'car': 'coche',
    'motorcycle': 'moto',
    'airplane': 'avión',
    'bus': 'autobús',
    'train': 'tren',
    'truck': 'camión',
    'boat': 'barco',
    'traffic light': 'semáforo',
    'fire hydrant': 'hidrante',
    'stop sign': 'señal de alto',
    'parking meter': 'parquímetro',
    'bench': 'banco',
    'bird': 'pájaro',
    'cat': 'gato',
    'dog': 'perro',
    'horse': 'caballo',
    'sheep': 'oveja',
    'cow': 'vaca',
    'elephant': 'elefante',
    'bear': 'oso',
    'zebra': 'cebra',
    'giraffe': 'jirafa',
    'backpack': 'mochila',
    'umbrella': 'paraguas',
    'handbag': 'bolso',
    'tie': 'corbata',
    'suitcase': 'maleta',
    'frisbee': 'frisbee',
    'skis': 'esquís',
    'snowboard': 'tabla de snowboard',
    'sports ball': 'pelota de deporte',
    'kite': 'cometa',
    'baseball bat': 'bate de béisbol',
    'baseball glove': 'guante de béisbol',
    'skateboard': 'skateboard',
    'surfboard': 'tabla de surf',
    'tennis racket': 'raqueta de tenis',
    'bottle': 'botella',
    'wine glass': 'copa de vino',
    'cup': 'taza',
    'fork': 'tenedor',
    'knife': 'cuchillo',
    'spoon': 'cuchara',
    'bowl': 'bol',
    'banana': 'plátano',
    'apple': 'manzana',
    'sandwich': 'sándwich',
    'orange': 'naranja',
    'broccoli': 'brócoli',
    'carrot': 'zanahoria',
    'hot dog': 'perrito caliente',
    'pizza': 'pizza',
    'donut': 'rosquilla',
    'cake': 'pastel',
    'chair': 'silla',
    'couch': 'sofá',
    'potted plant': 'planta en maceta',
    'bed': 'cama',
    'dining table': 'mesa de comedor',
    'toilet': 'inodoro',
    'tv': 'televisor',
    'laptop': 'portátil',
    'mouse': 'ratón',
    'remote': 'control remoto',
    'keyboard': 'teclado',
    'cell phone': 'teléfono móvil',
    'microwave': 'microondas',
    'oven': 'horno',
    'toaster': 'tostadora',
    'sink': 'fregadero',
    'refrigerator': 'refrigerador',
    'book': 'libro',
    'clock': 'reloj',
    'vase': 'jarrón',
    'scissors': 'tijeras',
    'teddy bear': 'osito de peluche',
    'hair drier': 'secador de pelo',
    'toothbrush': 'cepillo de dientes'
};

// Cargar el modelo COCO-SSD
async function loadModel() {
    result.innerText = 'Cargando modelo...';
    model = await cocoSsd.load();
    result.innerText = 'Modelo cargado.';
    startDetection();
}

// Obtener acceso a la cámara trasera
async function enableCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment'
            }
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accediendo a la cámara: ", error);
        result.innerText = 'No se pudo acceder a la cámara';
    }
}

// Detección en tiempo real
async function startDetection() {
    if (!model) {
        result.innerText = 'El modelo no está cargado.';
        return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const detectFrame = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const predictions = await model.detect(canvas);

        if (predictions.length > 0) {
            lastPrediction = predictions[0].class;
            const translatedPredictions = predictions.map(p => {
                const classInSpanish = translation[p.class] || p.class;
                return `${classInSpanish}: ${Math.round(p.score * 100)}%`;
            });
            result.innerHTML = translatedPredictions.join('<br>');
        } else {
            lastPrediction = null;
            result.innerText = 'No se detectaron objetos';
        }

        requestAnimationFrame(detectFrame);
    };

    detectFrame();
}

// Reconocimiento de voz
if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert('El reconocimiento de voz no es compatible con este navegador');
} else {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Transcripción: ', transcript);  // Verificar el comando detectado

        if (transcript.includes("qué se ve adelante")) {
            speakPrediction();
        } else if (transcript.includes("qué hora es")) {
            speakTime();
        } else if (transcript.includes("qué día es")) {
            speakDate();
        } else if (transcript.includes("dónde estoy")) {
            speakLocation();
        }
    };

    recognition.onerror = function(event) {
        console.error('Error en el reconocimiento de voz: ', event.error);
    };

    recognition.onend = function() {
        console.log('El reconocimiento de voz se ha detenido.');
    };

    function startListening() {
        recognition.start();
        console.log('Iniciando reconocimiento de voz...');
    }
}

// Función para decir el objeto detectado
function speakPrediction() {
    if (lastPrediction) {
        const predictionInSpanish = translation[lastPrediction] || lastPrediction;
        const speech = new SpeechSynthesisUtterance(`Veo un ${predictionInSpanish}`);
        speech.lang = 'es-ES';
        speech.rate = 0.7;
        window.speechSynthesis.speak(speech);
    } else {
        const speech = new SpeechSynthesisUtterance('No se ha detectado ningún objeto');
        speech.lang = 'es-ES';
        speech.rate = 0.7;
        window.speechSynthesis.speak(speech);
    }
}

// Función para decir la hora actual
function speakTime() {
    const now = new Date();
    const speech = new SpeechSynthesisUtterance(`Son las ${now.getHours()} y ${now.getMinutes()}`);
    speech.lang = 'es-ES';
    speech.rate = 0.7;
    window.speechSynthesis.speak(speech);
}

// Función para decir la fecha actual
function speakDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('es-ES', options);
    const speech = new SpeechSynthesisUtterance(`Hoy es ${dateString}`);
    speech.lang = 'es-ES';
    speech.rate = 0.7;
    window.speechSynthesis.speak(speech);
}

// Función para obtener la ubicación del usuario
function speakLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const speech = new SpeechSynthesisUtterance(`Tu ubicación actual es latitud ${latitude} y longitud ${longitude}`);
            speech.lang = 'es-ES';
            speech.rate = 0.7;
            window.speechSynthesis.speak(speech);
        }, error => {
            const speech = new SpeechSynthesisUtterance('No se pudo obtener la ubicación');
            speech.lang = 'es-ES';
            speech.rate = 0.7;
            window.speechSynthesis.speak(speech);
        });
    } else {
        const speech = new SpeechSynthesisUtterance('La geolocalización no está disponible en este dispositivo');
        speech.lang = 'es-ES';
        speech.rate = 0.7;
        window.speechSynthesis.speak(speech);
    }
}

// Iniciar el proceso al cargar la página
window.onload = async () => {
    await enableCamera();
    await loadModel();
};
// Asignar evento de click al botón para activar el reconocimiento de voz
document.getElementById('speak-button').addEventListener('click', () => {
    startListening();  // Llama a la función para iniciar el reconocimiento de voz
    console.log('Botón presionado, iniciando reconocimiento de voz');
});