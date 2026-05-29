const makeFilePathFromService = (fileName, bucket = "logos") => {
    return `/uploads/${bucket}/${fileName}`;
}

module.exports = { makeFilePathFromService }