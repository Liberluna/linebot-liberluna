export async function parseBody(r) {
    let body = {};
    const contentType = r.headers.get('Content-Type');
    if (contentType && (contentType.startsWith('multipart/form-data') || contentType === 'application/x-www-form-urlencoded')) {
        const form = {};
        (await r.formData()).forEach((value, key)=>{
            form[key] = value;
        });
        body = form;
    }
    return body;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdXRpbHMvYm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBCb2R5RGF0YSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IEZpbGU+XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXJzZUJvZHkocjogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gIGxldCBib2R5OiBCb2R5RGF0YSA9IHt9XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gci5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJylcbiAgaWYgKFxuICAgIGNvbnRlbnRUeXBlICYmXG4gICAgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ211bHRpcGFydC9mb3JtLWRhdGEnKSB8fFxuICAgICAgY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxuICApIHtcbiAgICBjb25zdCBmb3JtOiBCb2R5RGF0YSA9IHt9XG4gICAgOyhhd2FpdCByLmZvcm1EYXRhKCkpLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGZvcm1ba2V5XSA9IHZhbHVlXG4gICAgfSlcbiAgICBib2R5ID0gZm9ybVxuICB9XG4gIHJldHVybiBib2R5XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxlQUFlLFVBQVUsQ0FBcUIsRUFBRTtJQUNyRCxJQUFJLE9BQWlCLENBQUM7SUFDdEIsTUFBTSxjQUFjLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNsQyxJQUNFLGVBQ0EsQ0FBQyxZQUFZLFVBQVUsQ0FBQywwQkFDdEIsZ0JBQWdCLG1DQUFtQyxHQUNyRDtRQUNBLE1BQU0sT0FBaUIsQ0FBQztRQUN2QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLE1BQVE7WUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRztRQUNkO1FBQ0EsT0FBTztJQUNULENBQUM7SUFDRCxPQUFPO0FBQ1QsQ0FBQyJ9