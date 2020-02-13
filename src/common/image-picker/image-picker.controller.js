import signal from 'signal-js';
import { addEventListeners } from 'utils/dom';

function onInit(props, state, localSignals) {
    const {
        target,
    } = props;

    const imageUploader = target.querySelector('.image-uploader');

    // TODO: move to global listeners with callbacks []
    document.addEventListener('mouseup', () => {
        if (!state.transformEnabled) { return; }
        localSignals.emit('transform-progress', false)
    });
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        if (!state.transformEnabled) { return; }
        localSignals.emit('transform', clientX, clientY);
    });

    addEventListeners(target, [
        {
            target: imageUploader,
            type: 'change',
            callback: (e) => {
                const files = imageUploader.files;
                handleFiles(localSignals, files);
            }
        },
        {
            target: '.image-transformer--box',
            type: 'mousedown',
            callback: (e) => {
                const initialCoords = { dx: e.clientX, dy: e.clientY };
                localSignals.emit('transform-progress', true, initialCoords);
            }
        },
        {
            target: '.image-not-save-btn',
            type: 'click',
            callback: (e) => {
                localSignals.emit('image-not-save');
            }
        },
        {
            target: '.image-save-btn',
            type: 'click',
            callback: (e) => {
                localSignals.emit('image-save');
            }
        }
    ]);

    localSignals.on('image-not-save', () => {
        imageUploader.value = "";
    })
}

function handleFiles(localSignals, files) {
    const file = files[0];
    console.log('file', file);
    if (!file) { return }
    const reader = new FileReader()
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        localSignals.emit('select-image', {
            value: reader.result,
            name: file.name,
            type: file.type
        });
    };
}

// TODO: HoC and memo query selectors(?)
function render(props, state) {
    const { target } = props;
    const { selectedImage, previewImage } = state;
    const popupNode = target.querySelector('.image-picker-popup');
    if (selectedImage) {
        popupNode.classList.remove('hidden');
        popupNode.querySelectorAll('.image-transformer--image')
            .forEach(node => {
                node.src = state.selectedImage.value;
            });
    } else {
        popupNode.classList.add('hidden');
    }

    if (previewImage) {
        target.style.backgroundImage = `url(${previewImage})`;
        // TODO: Absolute values meh
        target.style.backgroundSize = '';
        target.style.backgroundPosition = `${state.position.x / 300 * 125}px ${state.position.y / 300 * 125}px`;
    } else {
        target.style.backgroundImage = '';
        target.style.backgroundSize = '';
        target.style.backgroundSize = '40px';
        target.style.backgroundPosition = '';
    }
}

function getNewPosition(state) {
    return {
        dx: state.position.x - state.clickInfo.dx,
        dy: state.position.y - state.clickInfo.dy,
    }
}

function updateImagePosition(target) {
    const imageNode1 = target.querySelector('.image-transformer--backgroud-image');
    return function(state) {
        const { dx, dy } = getNewPosition(state);
        imageNode1.style.top = `${dy}px`;
        imageNode1.style.left = `${dx}px`;
    }
}

// TODO: Add animation(header's transition animation)
function ImagePickerController(props) {
    const localSignals = signal();
    const signals = signal();
    const state = {
        previewImage: null,
        selectedImage: null,
        position: {
            x: props.translate && props.translate.x || 0,
            y: props.translate && props.translate.y || 0,
        },
        transformEnabled: false,
        clickInfo: {
            startX: 0,
            startY: 0,
            dx: 0,
            dy: 0,
        }
    }

    onInit(props, state, localSignals);

    const renderer = render.bind(this, props, state);
    renderer();

    const translateImage = updateImagePosition(props.target);

    localSignals.on('select-image', newImage => {
        state.selectedImage = newImage;
        state.position.x = 0;
        state.position.y = 0;
        state.clickInfo.dx = 0;
        state.clickInfo.dy = 0;
        translateImage(state);
        renderer();
    })

    localSignals.on('transform-progress', (isEnabled, coords) => {
        state.transformEnabled = isEnabled;
        if (!state.transformEnabled) { 
            const { dx, dy } = getNewPosition(state);
            state.position.x = dx;
            state.position.y = dy;
        } else {
            state.clickInfo.startX = coords.dx;
            state.clickInfo.startY = coords.dy;
        }
    })

    localSignals.on('transform', (dx, dy) => {
        state.clickInfo.dx = state.clickInfo.startX - dx;
        state.clickInfo.dy = state.clickInfo.startY - dy;
        translateImage(state);
    })

    localSignals.on('image-not-save', () => {
        state.position.x = props.translate && props.translate.x || 0;
        state.position.y = props.translate && props.translate.y || 0;
        state.selectedImage = null;
        renderer();
    })

    localSignals.on('image-save', () => {
        const { position, selectedImage } = state;
        state.previewImage = selectedImage.value;
        signals.emit('onChange', selectedImage, position);
        state.selectedImage = null;
        renderer();
    })

    return { signals };
}

export default ImagePickerController;