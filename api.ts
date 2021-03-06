export default {

}

// ===== ===== ===== ===== ===== ===== ===== ===== ===== =====

type Response<T> = { success: true, data: T, error: null } | { success: false, data: null, error: { code: string, message: string } }

const error = (code: string, message: string): Response<null> => ({
	success: false, data: null, error: { code, message }
});

export class API {
	static base_url: string = 'http://localhost:5000'
	static auth?: () => string
	static error_code_handler: { [error_code: string]: () => void } = { }
	static error_handler?: (error: { code: string, message: string }) => void
}

async function wrap_request<T>(url: string, request: RequestInit): Promise<Response<T>> {
	try {
		const response = await fetch(url, request);
		let data: Response<T>;
		if (response.ok) {
			data = await response.json();
		} else {
			const content = await response.text()
			const failure = !content? error(`HTTP_${response.status}`, `HTTP: ${response.statusText}`) : JSON.parse(content);
			if (failure.title)
				data = error(
					response.statusText.toUpperCase().replace(/\s/g, '_'), 
					`${failure.title}\n${(Object.values(failure.errors) as string[][]).reduce((a, b) => a.concat(b)).map(e => ` - ${e}`).join('\n')}`
				) as any;
			else
				data = failure;
			const handler = API.error_code_handler[failure.error?.code]
			if (handler != undefined)
				handler()
		}
		if (data.success)
			console.debug(`response from ${request.method?.toLowerCase()} to ${url.replace(API.base_url, '')}:`, data.data);
		else {
			console.debug(`failure from ${request.method?.toLowerCase()} to ${url.replace(API.base_url, '')}:`, data.error)
			API.error_handler?.(data.error)
		}
		return data;
	} catch (ex) {
		const _error = error('UNKNOWN', (ex as any).message) as any;
		console.error(`error on ${request.method?.toLowerCase()} request to ${url.replace(API.base_url, '')}:`, _error);
		API.error_handler?.(_error.error)
		return _error;
	}
	
}

async function get<T>(url: string): Promise<Response<T>> {
	console.debug(`get ${url.replace(API.base_url, '')}`);
	return await wrap_request(url, {
		method: 'GET',
		headers: API.auth?.()
			? { Authorization: API.auth?.() as string }
			: undefined 
	});
}

async function post<T>(url: string, body?: any): Promise<Response<T>> {
	console.debug(`post to ${url.replace(API.base_url, '')}:`, body);
	return await wrap_request(url, {
		method: 'POST',
		headers: {
			...(API.auth?.()? { Authorization: API.auth?.() } : { }),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
}

async function put<T>(url: string, body?: any): Promise<Response<T>> {
	console.debug(`put to ${url.replace(API.base_url, '')}:`, body);
	return await wrap_request(url, {
		method: 'PUT',
		headers: {
			...(API.auth?.()? { Authorization: API.auth?.() } : { }),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
}

async function del<T>(url: string): Promise<Response<T>> {
	console.debug(`delete ${url.replace(API.base_url, '')}`);
	return await wrap_request(url, {
		method: 'DELETE',
		headers: API.auth?.()
			? { Authorization: API.auth?.() as string }
			: undefined 
	});
}

const api = (...fragments: (string | number)[]): string => [API.base_url].concat(<any>fragments).join('/')