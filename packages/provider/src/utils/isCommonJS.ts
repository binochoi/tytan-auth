export const isCommonJS = () => {
    try {
        return !!module.exports;
    } catch {
        return false;
    }
};