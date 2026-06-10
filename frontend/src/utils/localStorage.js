export function setItem(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        console.log(error);
    }
}

export function getItem(key) {
    try {
        return window.localStorage.getItem(key);
    } catch(error) {
        console.log(error);
    }
}