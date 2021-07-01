module.exports = {
  email: /^[a-z0-9]([a-z0-9.+_-]*[a-z0-9]+)?@([a-z0-9]+([a-z0-9-]*[a-z0-9]+)*)+(\.[a-z0-9]{1,63})*(\.(?=.*[a-z])[a-z0-9]{1,63})+$/,
  alphanumeric: /^[a-z0-9]+$/i,
  alphanumericunderscore: /^[a-z0-9_]+$/i,
  numeric: /^[0-9]+$/,
  website: (websiteUrl) => {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(websiteUrl);
  }
}