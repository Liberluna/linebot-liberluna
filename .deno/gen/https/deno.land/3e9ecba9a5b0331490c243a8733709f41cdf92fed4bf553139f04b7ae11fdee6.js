export const getStatusText = (statusCode)=>{
    const text = statuses[statusCode];
    return text;
};
const statuses = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    206: 'Partial Content',
    301: 'Moved Permanently',
    302: 'Moved Temporarily',
    303: 'See Other',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Not Allowed',
    406: 'Not Acceptable',
    408: 'Request Time-out',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Large',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    421: 'Misdirected Request',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Temporarily Unavailable',
    504: 'Gateway Time-out',
    505: 'HTTP Version Not Supported',
    507: 'Insufficient Storage'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdXRpbHMvaHR0cC1zdGF0dXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdldFN0YXR1c1RleHQgPSAoc3RhdHVzQ29kZTogU3RhdHVzQ29kZSk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHRleHQgPSBzdGF0dXNlc1tzdGF0dXNDb2RlXVxuICByZXR1cm4gdGV4dFxufVxuXG5leHBvcnQgdHlwZSBTdGF0dXNDb2RlID1cbiAgfCAxMDBcbiAgfCAxMDFcbiAgfCAxMDJcbiAgfCAxMDNcbiAgfCAyMDBcbiAgfCAyMDFcbiAgfCAyMDJcbiAgfCAyMDNcbiAgfCAyMDRcbiAgfCAyMDVcbiAgfCAyMDZcbiAgfCAyMDdcbiAgfCAyMDhcbiAgfCAyMjZcbiAgfCAzMDBcbiAgfCAzMDFcbiAgfCAzMDJcbiAgfCAzMDNcbiAgfCAzMDRcbiAgfCAzMDVcbiAgfCAzMDZcbiAgfCAzMDdcbiAgfCAzMDhcbiAgfCA0MDBcbiAgfCA0MDFcbiAgfCA0MDJcbiAgfCA0MDNcbiAgfCA0MDRcbiAgfCA0MDVcbiAgfCA0MDZcbiAgfCA0MDdcbiAgfCA0MDhcbiAgfCA0MDlcbiAgfCA0MTBcbiAgfCA0MTFcbiAgfCA0MTJcbiAgfCA0MTNcbiAgfCA0MTRcbiAgfCA0MTVcbiAgfCA0MTZcbiAgfCA0MTdcbiAgfCA0MThcbiAgfCA0MjBcbiAgfCA0MjFcbiAgfCA0MjJcbiAgfCA0MjNcbiAgfCA0MjRcbiAgfCA0MjVcbiAgfCA0MjZcbiAgfCA0MjhcbiAgfCA0MjlcbiAgfCA0MzFcbiAgfCA0NDRcbiAgfCA0NDlcbiAgfCA0NTBcbiAgfCA0NTFcbiAgfCA0OTlcbiAgfCA1MDBcbiAgfCA1MDFcbiAgfCA1MDJcbiAgfCA1MDNcbiAgfCA1MDRcbiAgfCA1MDVcbiAgfCA1MDZcbiAgfCA1MDdcbiAgfCA1MDhcbiAgfCA1MDlcbiAgfCA1MTBcbiAgfCA1MTFcbiAgfCA1OThcbiAgfCA1OTlcblxuY29uc3Qgc3RhdHVzZXM6IFJlY29yZDxTdGF0dXNDb2RlIHwgbnVtYmVyLCBzdHJpbmc+ID0ge1xuICAxMDA6ICdDb250aW51ZScsXG4gIDEwMTogJ1N3aXRjaGluZyBQcm90b2NvbHMnLFxuICAxMDI6ICdQcm9jZXNzaW5nJyxcbiAgMTAzOiAnRWFybHkgSGludHMnLFxuICAyMDA6ICdPSycsXG4gIDIwMTogJ0NyZWF0ZWQnLFxuICAyMDI6ICdBY2NlcHRlZCcsXG4gIDIwNDogJ05vIENvbnRlbnQnLFxuICAyMDY6ICdQYXJ0aWFsIENvbnRlbnQnLFxuICAzMDE6ICdNb3ZlZCBQZXJtYW5lbnRseScsXG4gIDMwMjogJ01vdmVkIFRlbXBvcmFyaWx5JyxcbiAgMzAzOiAnU2VlIE90aGVyJyxcbiAgMzA0OiAnTm90IE1vZGlmaWVkJyxcbiAgMzA3OiAnVGVtcG9yYXJ5IFJlZGlyZWN0JyxcbiAgMzA4OiAnUGVybWFuZW50IFJlZGlyZWN0JyxcbiAgNDAwOiAnQmFkIFJlcXVlc3QnLFxuICA0MDE6ICdVbmF1dGhvcml6ZWQnLFxuICA0MDI6ICdQYXltZW50IFJlcXVpcmVkJyxcbiAgNDAzOiAnRm9yYmlkZGVuJyxcbiAgNDA0OiAnTm90IEZvdW5kJyxcbiAgNDA1OiAnTm90IEFsbG93ZWQnLFxuICA0MDY6ICdOb3QgQWNjZXB0YWJsZScsXG4gIDQwODogJ1JlcXVlc3QgVGltZS1vdXQnLFxuICA0MDk6ICdDb25mbGljdCcsXG4gIDQxMDogJ0dvbmUnLFxuICA0MTE6ICdMZW5ndGggUmVxdWlyZWQnLFxuICA0MTI6ICdQcmVjb25kaXRpb24gRmFpbGVkJyxcbiAgNDEzOiAnUmVxdWVzdCBFbnRpdHkgVG9vIExhcmdlJyxcbiAgNDE0OiAnUmVxdWVzdC1VUkkgVG9vIExhcmdlJyxcbiAgNDE1OiAnVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZScsXG4gIDQxNjogJ1JlcXVlc3RlZCBSYW5nZSBOb3QgU2F0aXNmaWFibGUnLFxuICA0MjE6ICdNaXNkaXJlY3RlZCBSZXF1ZXN0JyxcbiAgNDI5OiAnVG9vIE1hbnkgUmVxdWVzdHMnLFxuICA1MDA6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxuICA1MDE6ICdOb3QgSW1wbGVtZW50ZWQnLFxuICA1MDI6ICdCYWQgR2F0ZXdheScsXG4gIDUwMzogJ1NlcnZpY2UgVGVtcG9yYXJpbHkgVW5hdmFpbGFibGUnLFxuICA1MDQ6ICdHYXRld2F5IFRpbWUtb3V0JyxcbiAgNTA1OiAnSFRUUCBWZXJzaW9uIE5vdCBTdXBwb3J0ZWQnLFxuICA1MDc6ICdJbnN1ZmZpY2llbnQgU3RvcmFnZScsXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLGdCQUFnQixDQUFDLGFBQW1DO0lBQy9ELE1BQU0sT0FBTyxRQUFRLENBQUMsV0FBVztJQUNqQyxPQUFPO0FBQ1QsRUFBQztBQTJFRCxNQUFNLFdBQWdEO0lBQ3BELEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7QUFDUCJ9