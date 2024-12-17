localStorage.setItem("find_mode", "strict");

let strict = document.getElementById('strict');
let flexible = document.getElementById('flexible');

if (localStorage.getItem("find_mode") === "flexible") {
    document.getElementById('flexible').classList.add('active');
    document.getElementById('strict').classList.remove('active');
}else{
    document.getElementById('flexible').classList.remove('active');
    document.getElementById('strict').classList.add('active');
}

strict.addEventListener('click', () => {
    localStorage.setItem("find_mode", "strict");
    document.getElementById('flexible').classList.remove('active');
    document.getElementById('strict').classList.add('active');
});

flexible.addEventListener('click', () => {
    localStorage.setItem("find_mode", "flexible");
    document.getElementById('strict').classList.remove('active');
    document.getElementById('flexible').classList.add('active');
});


function Check_mode(all_faces, faces_target) {
    if (localStorage.getItem("find_mode") === "flexible") {
        return Flexible_mode(all_faces, faces_target);
    } else {
        return Strict_mode(all_faces, faces_target);
    }
}
function Flexible_mode(all_faces, faces_target) {
    for (let i = 0; i < all_faces.length; i++) {
        for (let j = 0; j < faces_target.length; j++) {
            const distance = faceapi.euclideanDistance(all_faces[i].descriptor, faces_target[j].descriptor);
            if (distance < 0.5) {
                return true;
            }
        }
    }
    return false;
}
function Strict_mode(all_faces, faces_target) {
    if (all_faces.length !== faces_target.length) {
        return false; 
    }
    const isMatch = (face, targets) => {
        return targets.some(target => {
            const distance = faceapi.euclideanDistance(face.descriptor, target.descriptor);
            return distance < 0.5;
        });
    };

    for (let i = 0; i < all_faces.length; i++) {
        if (!isMatch(all_faces[i], faces_target)) {
            return false; 
        }
    }
    return true; 
}


if (!faceapi.nets.faceExpressionNet.isLoaded) {
    console.error('Le modèle faceExpressionNet n\'est pas chargé.');
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

const mode_select = document.getElementById('mode_select');
const file_input_face_target = document.getElementById('file_input_face_target');
const file_input_face_target_label = document.getElementById('file_input_face_target_label');
const result_input_face_target = document.getElementById('result_input_face_target');
const loading_face_target = document.getElementById('loading_face_target');
let count_input_face_target = 0;
let faces_target = [];

file_input_face_target.addEventListener('change', async () => {
    file_input_face_target_label.classList.add('hidden');
    loading_face_target.classList.remove('hidden');
    mode_select.classList.add('hidden');

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
                faces_target = detections;

                detections.forEach((detection, index) => {
                    const renderedFace = renderFaceWithInput(img, detection.detection.box);
                    const faceResult = document.createElement('div');
                    faceResult.style.marginBottom = '20px';
                    faceResult.style.display = 'flex';
                    faceResult.style.flexDirection = 'column';
                    faceResult.style.alignItems = 'center';

                    faceResult.innerHTML = `
                        <img src="${renderedFace}" alt="Visage détecté" style="max-width: 200px; border: 1px solid #ccc; margin-bottom: 10px;">
                        <input type="text" id="input_name_face_target_${index}" placeholder="Nom de la personne" style="width: 200px; padding: 5px;">
                    `;

                    result_input_face_target.appendChild(faceResult);
                    count_input_face_target++;
                });

                result_input_face_target.classList.remove('hidden');
            } catch (error) {
                console.error('Erreur lors de la détection:', error);
            } finally {
                file_input_picture_find_label.classList.remove('hidden');
                loading_face_target.classList.add('hidden');
            }
        };

        img.onerror = () => {
            console.error('Erreur lors du chargement de l\'image.');
            loading_face_target.classList.add('hidden');
        };
    }
});



let file_input_picture_find = document.getElementById('file_input_picture_find');
let file_input_picture_find_label = document.getElementById('file_input_picture_find_label');
let result_input_picture_find = document.getElementById('result_input_picture_find');
let loading_picture_find = document.getElementById('loading_picture_find');
let picture_ok = [];

// Inclure JSZip via un CDN (à inclure dans votre HTML ou à charger dynamiquement)
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
document.head.appendChild(script);

file_input_picture_find.addEventListener('change', async () => {
    let name_of_file = '';
    while (count_input_face_target > 0) {
        const input_name_face_target = document.getElementById(`input_name_face_target_${count_input_face_target - 1}`);
        name_of_file += input_name_face_target.value + '_';
        count_input_face_target--;
    }

    result_input_face_target.classList.add('hidden');   
    file_input_picture_find_label.classList.add('hidden');
    loading_picture_find.classList.remove('hidden');
    result_input_picture_find.innerHTML = ''; // Réinitialiser les résultats
    picture_ok = []; // Réinitialiser les images correspondantes

    const files = file_input_picture_find.files;
    if (!files.length) return;

    for (const file of files) {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        await new Promise(resolve => {
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

                    // Verification de la photo en fonction du mode de correspondance
                    Check_mode(detections, faces_target) ? picture_ok.push(file) : console.log("Pas de correspondance");
                    
                } catch (error) {
                    console.error('Erreur lors de la détection:', error);
                } finally {
                    resolve();
                }
            };

            img.onerror = () => {
                console.error('Erreur lors du chargement de l\'image.');
                resolve();
            };
        });
    }

    const zip = new JSZip();
    const folder = zip.folder("images");

    picture_ok.forEach((file, index) => {
        const fileName = `image_${index + 1}.${file.type.split('/')[1]}`; 
        folder.file(fileName, file); 
    });

    zip.generateAsync({ type: "blob" })
        .then(content => {
            const zipName = `${name_of_file || "result"}.zip`;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            a.download = zipName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log(`Fichier ${zipName} téléchargé avec succès.`);
            window.location.reload();
        })
        .catch(error => {
            console.error("Erreur lors de la génération du ZIP :", error);
        });

    loading_picture_find.classList.add('hidden'); // Masquer l'indicateur de chargement
});