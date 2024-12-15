if (!faceapi.nets.faceExpressionNet.isLoaded) {
    console.error('Le modèle faceExpressionNet n\'est pas chargé.');
} else {
    console.log('Le modèle faceExpressionNet est prêt à être utilisé.');
}

async function loadModels() {
    const MODEL_URL = './models';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    console.log('Modèles chargés avec succès');
}

loadModels();

const renderFaceWithInput = (image, detectionBox) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0, image.width, image.height);

    const { x, y, width, height } = detectionBox;
    context.strokeStyle = "#00FF00"; // Couleur du cadre
    context.lineWidth = 5;
    context.strokeRect(x, y, width, height);

    return canvas.toDataURL("image/jpeg");
};

const file_input_face_target = document.getElementById('file_input_face_target');
const file_input_face_target_label = document.getElementById('file_input_face_target_label');
const result_input_face_target = document.getElementById('result_input_face_target');
const loading_face_target = document.getElementById('loading_face_target');

file_input_face_target.addEventListener('change', async () => {
    file_input_face_target_label.classList.add('hidden');
    loading_face_target.classList.remove('hidden');
    result_input_face_target.innerHTML = ''; // Réinitialiser les résultats

    const files = file_input_face_target.files;
    if (!files.length) return;

    for (const file of files) {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            try {
                const detections = await faceapi
                    .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions()
                    .withFaceDescriptors();

                if (detections.length === 0) {
                    console.log("Aucun visage détecté");
                }

                detections.forEach((detection, index) => {
                    const renderedFace = renderFaceWithInput(img, detection.detection.box);
                    const faceResult = document.createElement('div');
                    faceResult.style.marginBottom = '20px';
                    faceResult.style.display = 'flex';
                    faceResult.style.flexDirection = 'column';
                    faceResult.style.alignItems = 'center';

                    faceResult.innerHTML = `
                        <img src="${renderedFace}" alt="Visage détecté" style="max-width: 200px; border: 1px solid #ccc; margin-bottom: 10px;">
                        <input type="text" placeholder="Nom de la personne" style="width: 200px; padding: 5px;">
                    `;

                    result_input_face_target.appendChild(faceResult);
                });

                result_input_face_target.classList.remove('hidden');
            } catch (error) {
                console.error('Erreur lors de la détection:', error);
            } finally {
                loading_face_target.classList.add('hidden');
            }
        };

        img.onerror = () => {
            console.error('Erreur lors du chargement de l\'image.');
            loading_face_target.classList.add('hidden');
        };
    }
});
