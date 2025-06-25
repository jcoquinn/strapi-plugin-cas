import { XMLParser } from 'fast-xml-parser';

type Attrs = {
	username: string;
	email: string;
	[key: string]: string;
};

class Validator {
	public url: string;
	private errPrefix = 'CAS:';
	private parser: XMLParser;

	static #instance: Validator;

	static getInstance() {
		if (Validator.#instance) {
			return Validator.#instance;
		}
		Validator.#instance = new Validator();
		Validator.#instance.url = strapi.plugin('cas').config('url');
		Validator.#instance.parser = new XMLParser();
		return Validator.#instance;
	}

	public async validate(ticket: string, service: string): Promise<Attrs> {
		const xml = await this.serviceValidate(ticket, service);
		return this.serviceResponse(xml);
	}

	private async serviceValidate(ticket: string, service: string): Promise<string> {
		const t = encodeURIComponent(ticket);
		const s = encodeURIComponent(service);
		const url = `${this.url}/serviceValidate?ticket=${t}&service=${s}`;

		const resp = await fetch(url, { headers: { Accept: 'application/xml' } });
		if (!resp.ok) {
			throw this.newError(`failed validating ticket: ${resp.status} ${resp.statusText}`);
		}
		return await resp.text();
	}

	private serviceResponse(xml: string): Attrs {
		const data = this.parser.parse(xml);
		const root = data['cas:serviceResponse'];
		const success = root['cas:authenticationSuccess'];
		const failure = root['cas:authenticationFailure'];

		if (success) {
			const username = success['cas:user'];
			if (!username) {
				throw this.newError('authenticationSuccess missing username');
			}
			const attrs: Attrs = { username, email: null };
			for (const [key, val] of Object.entries(success['cas:attributes'] || {})) {
				const k = key.replace(/^cas:/, '');
				attrs[k] = val as string;
			}
			if (!attrs.email) {
				throw this.newError('cas:attributes missing email');
			}
			return attrs;
		}
		if (failure) {
			throw this.newError(failure['#text'] || 'ticket validation failed');
		}
		throw this.newError('invalid serviceResponse');
	}

	private newError(message: string): Error {
		return new Error(`${this.errPrefix} ${message}`);
	}
}

const ticket = () => ({
	async validate(ticket: string, service: string): Promise<Attrs> {
		return Validator.getInstance().validate(ticket, service);
	},
});

export default ticket;
