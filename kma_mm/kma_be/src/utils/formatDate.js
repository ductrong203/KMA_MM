const formatDate = (stringDate) => {
    const date = new Date(stringDate);

    return date.toLocaleDateString('vi-VN');

};
// console.log(formatDate("2025-08-04T00:00:00.000Z"));
module.exports = { formatDate};