const fs = require('fs');
const finished = require('stream-promise')
const sharp = require('sharp');
const moment = require('moment');
const momentRange = require('moment-range');
const momentOfRange = momentRange.extendMoment(moment);
const _ = require('lodash');

const resizeBase64 = async ({
    base64Image,
    maxHeight = 400,
    maxWidth = 400
}) => {
    const destructImage = base64Image.split(";");
    const mimType = destructImage[0].split(":")[1];
    const imageData = destructImage[1].split(",")[1];

    try {
        let resizedImage = Buffer.from(imageData, "base64")
        resizedImage = await sharp(resizedImage).resize(maxHeight, maxWidth).toBuffer()

        return `data:${mimType};base64,${resizedImage.toString("base64")}`
    } catch (error) {
        console.log(error)
    }
};

async function convertMediaToBase64(mimetype, data) {
    try {
        let base64 = data._readableState.buffer.head.data.toString('base64')
        return `data:${mimetype};base64,${base64}`
    } catch (error) {
        console.log(error)
    }
}

async function writeFile(createReadStream, fileNameAndPath) {
    try {
        const out = fs.createWriteStream(fileNameAndPath);
        createReadStream.pipe(out);
        await finished(out);
        return true;
    } catch (err) {
        // console.log(err)
        return false;
    }
};

async function UploadFoto(filename, createReadStream, filePath) {
    filePath = filePath ? filePath : `./static/`;
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, {
            recursive: true
        });
    }
    filePath = `${filePath}/${filename}`

    if (filename && filePath) {
        await writeFile(createReadStream, filePath)
        return filePath;
    } else {
        return false
    }
};

function splitFilenameAndExtension(filename) {
    // Use the lastIndexOf method to find the last dot (.) in the filename
    const dotIndex = filename.lastIndexOf('.');

    // Check if a dot was found and make sure it's not the first character
    if (dotIndex >= 0 && dotIndex < filename.length - 1) {
        // Extract the filename and extension based on the dot's position
        const name = filename.slice(0, dotIndex);
        const extension = filename.slice(dotIndex + 1);

        return {
            filename: name,
            extension: extension,
        };
    } else {
        // If no dot is found or it's the first character, treat the whole string as the filename
        return {
            filename: filename,
            extension: '',
        };
    }
}

function createDiacriticSensitiveRegex(searchTerm) {
    const escapedTerm = searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape special characters
    const diacriticRegex = /[\u0300-\u036f]/g; // Diacritic characters range

    return new RegExp(escapedTerm.replace(diacriticRegex, '[\\u0300-\\u036f]?'), 'i');
}

const rentangWaktu = async (rentang, start_date) => {
    const end = momentOfRange();
    const start = !start_date ? momentOfRange().subtract(rentang, 'days') : momentOfRange(start_date, "YYYY-MM-DD").subtract(rentang, 'days')

    let rangeOfDate = momentOfRange.range(start, end);
    rangeOfDate = Array.from(rangeOfDate.by('days'));
    rangeOfDate = rangeOfDate.map(val => val.format('YYYY-MM-DD'));
    return rangeOfDate;
}

const getStartEndDate = (filter) => {
    let startDate, endDate

    filter.tipe_laporan = filter && filter.tipe_laporan ? filter.tipe_laporan : "bulanan"
    if (filter && filter.tipe_laporan) {
        let spesificDate = filter.pilih_tanggal ? filter.pilih_tanggal : ''
        if (filter.tipe_laporan == 'bulanan') {
            startDate = spesificDate ? moment(spesificDate, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD') : moment().startOf('month').format('YYYY-MM-DD');
            endDate = spesificDate ? moment(spesificDate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD') : moment().endOf('month').format('YYYY-MM-DD');

        } else if (filter.tipe_laporan == 'mingguan') {
            startDate = filter.start_date ? moment(filter.start_date, "YYYY-MM-DD").format("YYYY-MM-DD") : moment().startOf('week').format("YYYY-MM-DD");
            endDate = filter.end_date ? moment(filter.end_date, "YYYY-MM-DD").format("YYYY-MM-DD") : moment().endOf('week').format("YYYY-MM-DD");

        } else if (filter.tipe_laporan == 'harian') {
            startDate = spesificDate ? moment(spesificDate, 'YYYY-MM-DD').format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
            endDate = startDate

        } else if (filter.tipe_laporan == 'kastem') {
            startDate = filter.start_date ? moment(filter.start_date, "YYYY-MM-DD").format("YYYY-MM-DD") : moment().startOf('month').format("YYYY-MM-DD");
            endDate = filter.end_date ? moment(filter.end_date, "YYYY-MM-DD").format("YYYY-MM-DD") : moment().endOf('month').format("YYYY-MM-DD");

        } else {
            // not defined (its mean all periode) 
        }
    }
    return {
        startDate,
        endDate
    }
}

const paginateArray = (array, limit, page) => {
    const startIndex = page * limit;
    let endIndex = startIndex + limit;

    if (limit === Infinity) {
        // If limit is set to Infinity, endIndex should be the length of the array
        endIndex = array.length;
    } else if (startIndex >= array.length) {
        // If the start index exceeds the length of the array,
        // return an empty array, indicating no results for this page.
        return [];
    }

    // Use _.slice to handle cases where endIndex exceeds the array length.
    return _(array)
        .slice(startIndex, endIndex)
        .value();
}

const findObjectWithLowestValue = (arr, prop) => {
    if (arr.length === 0) return null;

    let lowestObject = arr[0]; // Assume the first object has the lowest value initially
    for (let i = 1; i < arr.length; i++) {
        if (arr[i][prop] < lowestObject[prop]) {
            lowestObject = arr[i]; // Update the lowestObject if a smaller value is found
        }
    }
    return lowestObject;
}

function getHoursDetailFromHourFloat(hours) {
    // Convert hours to moment duration
    const duration = moment.duration(hours, "hours");
    // Format the duration as HH:mm:ss
    return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
}

function getMinutesDetailFromMinuteFloat(minutes) {
    // Convert minutes to moment duration
    const duration = moment.duration(Math.abs(minutes), "minutes");

    // Format the duration as HH:mm:ss
    return minutes < 0 ? `-${moment.utc(duration.asMilliseconds()).format("HH:mm:ss")}` : moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
}

function getMinutesDetailFromSecondFloat(seconds) {
    // Convert seconds to moment duration
    const duration = moment.duration(seconds, "seconds");

    // Format the duration as HH:mm:ss
    return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
}

function convertToCsv(data, headers, delimiter = ',', top_header, footer) {
    let csv = '';
    if (top_header && top_header.length) {
        for (const item of top_header) {
            if (item.length) {
                for (const value of item) {
                    csv += `${value},`
                }
                csv += '\n';
            }
        }
        csv += '\n';
    }
    if (headers) {
        csv += headers.map(headerRow => headerRow.join(delimiter)).join('\n');
        csv += '\n';
    }
    if (data && data.length) {
        csv += data.map(row => Object.values(row).join(delimiter)).join('\n');
    }
    if (footer) {
        csv += '\n';
        for (const item of footer) {
            for (const [key, value] of Object.entries(item)) {
                csv += `${key}, ${value}\n`;
            }
        }
    }

    return csv;
}

function getAlldaysString(startDate, endDate) {
    let currentDate = moment(startDate, 'YYYY-MM-DD');
    const lastDate = moment(endDate, 'YYYY-MM-DD');
    const dates = [];

    while (currentDate.isSameOrBefore(lastDate)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'day');
    }

    return dates;
}

module.exports = {
    rentangWaktu,
    resizeBase64,
    convertMediaToBase64,
    UploadFoto,
    writeFile,
    splitFilenameAndExtension,
    createDiacriticSensitiveRegex,
    paginateArray,
    getStartEndDate,
    findObjectWithLowestValue,
    getHoursDetailFromHourFloat,
    getMinutesDetailFromMinuteFloat,
    getMinutesDetailFromSecondFloat,
    convertToCsv,
    getAlldaysString
}