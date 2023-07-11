const googleAPIURL = `https://chart.googleapis.com/chart?cht=qr`;

/*
Query Parameters

-ht=qr	'Required'	Specifies a QR code.
- chs=<width>x<height>	'Required'	Image size.
- chl=<data>	'Required'	The data to encode. 
*/

module.exports = {
  generateQR(data, height, width) {
    if (!data) {
      return `URL must have data `;
    }
    const chartSize = height && width ? `${height}x${width}` : '200x200';
    const chartURL = `${googleAPIURL}&chl=${data}&chs=${chartSize}`;

    return chartURL;
  },
};
