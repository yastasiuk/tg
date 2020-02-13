import signal from 'signal-js';
import find from 'lodash/find';
import { addEventListeners, getNode } from 'utils/dom';

const phoneCodes = [
    {
        id: '1',
        name: 'Ukraine',
        code: '+380',
        icon: 'ukraine',
    }, {
        id: '2',
        name: 'Canada',
        code: '+1',
        icon: 'canada',
    }
];

function addDropDownCountriesList(node) {
    const targetNode = getNode(node, '#contries__list');
    phoneCodes.forEach(country => {
        const { id, name, code, icon } = country;
        const option = document.createElement("div");
        option.classList.add('country-option');
        option.setAttribute("id", id);

        const n_icon = document.createElement("i");
        n_icon.textContent = icon;

        const n = document.createElement("h5");
        n.classList.add('country-name')
        n.textContent = name;

        const t = document.createElement("p");
        t.classList.add('country-code')
        t.textContent = `(${code})`;

        option.appendChild(n_icon);
        option.appendChild(n);
        option.appendChild(t);
        targetNode.appendChild(option);
    });
}

function onInit(props, state, localSignal) {
    const { target, country } = props;

    state.selectedCountry = country;
    updateCountryUI(target, state.selectedCountry, state.hoveredCountry);

    addDropDownCountriesList(target);
    // TODO: move to global listeners with callbacks []
    document.addEventListener('click', () => localSignal.emit('dropdown-hide'));
    addEventListeners(target, [
        {
            type: 'click',
            target: '#country-dropdown__input',
            callback: (event) => {
                event.preventDefault();
                event.stopPropagation();
                localSignal.emit('dropdown-click');
            }
        },
        {
            type: 'click',
            target: '#contries__list',
            callback: (e) => {
                localSignal.emit('dropdown-selection', e.target.id);
            }
        }, {
            type: 'mouseover',
            target: '.country-option',
            callback: (e) => {
                localSignal.emit('dropdown-mouseover', e.target.id);
            }
        }, {
            type: 'mouseleave',
            target: '.country-option',
            callback: (e) => {
                localSignal.emit('dropdown-mouseleave', e.target.id);
            }
        }
    ]);
}

function updateDropDownVisibility(target, isDropDownActive) {
    const dropdown = target.querySelector(".structure");
    const input = target.querySelector("#country-dropdown__input");

    if (isDropDownActive) {
        dropdown.classList.remove("hide");
        input.classList.add("input__active");
    } else {
        dropdown.classList.add("hide");
        input.classList.remove("input__active");
    }
}

function updateCountryUI(target, selectedCountry, hoveredCountry) {
    const input = target.querySelector('.placeholder');
    if (selectedCountry) {
        input.textContent = selectedCountry.name;
        input.classList.add('selected');
    } else if (hoveredCountry) {
        input.textContent = hoveredCountry.name;
        input.classList.remove('selected');
    } else {
        // remove(?)
    }
}

function render(targetNode, state) {
    updateDropDownVisibility(targetNode, state.isDropDownActive);
    updateCountryUI(targetNode, state.selectedCountry, state.hoveredCountry);
}

// TODO: selection via "Tab" key
function DropDownController (props) {
    const localSignal = signal();
    const signals = signal();
    const state = {
        isDropDownActive: false,
        selectedCountry: null,
        hoveredCountry: null,
    }

    const renderer = render.bind(this, props.target, state);
    
    onInit(props, state, localSignal);

    localSignal.on('dropdown-click', () => {
        state.isDropDownActive = !state.isDropDownActive;
        renderer();
    });

    localSignal.on('dropdown-hide', () => {
        if (state.isDropDownActive) {
            state.isDropDownActive = false;
            renderer();
        }
    })

    localSignal.on('dropdown-selection', (countryId) => {
        const selectedCountry = find(phoneCodes, country => country.id === countryId);
        if (!selectedCountry || state.selectedCountry === selectedCountry) {
            return;
        }
        if (!selectedCountry) return;
        state.selectedCountry = selectedCountry;
        signals.emit('selection-update', selectedCountry);
        renderer();
    });

    localSignal.on('dropdown-mouseover', (countryId) => {
        const hoveredCountry = find(phoneCodes, country => country.id === countryId);
        if (!hoveredCountry || state.hoveredCountry === hoveredCountry) {
            return;
        }
        state.hoveredCountry = hoveredCountry;
        renderer();
    });

    localSignal.on('dropdown-mouseleave', (countryId) => {
        const unHoveredCountry = find(phoneCodes, country => country.id === countryId);
        if (!unHoveredCountry || state.hoveredCountry !== unHoveredCountry) {
            return;
        }
        state.hoveredCountry = null;
        renderer();
    });

    return { signals };
}

export default DropDownController;