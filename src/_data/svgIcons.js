const fg = require('fast-glob');
const path = require('path');
const fs = require('fs');

module.exports = function() {
    return new Promise(async (resolve, reject) => {
        const iconFolder = path.resolve(__dirname, '../static/icons/');
        const svgIcons = await fg('**/*.svg', { cwd: iconFolder })
        const iconData = await Promise.all(svgIcons.map(async (file) => {
            const name = path.parse(file).name;
            const filePath = '/static/icons/' + file
            const source = fs.readFileSync(path.resolve(iconFolder, file), { encoding: 'utf8' });
            // const sourceWithClass = source.replace('<svg', '<svg class="my-custom-class"');
            return { name, file, filePath, source };
        }));
        resolve(iconData);
    });
};