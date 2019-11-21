const crypto = require('crypto');
const base64url = require('base64url');
const cbor = require('cbor');
const jsrsasign = require('jsrsasign');
// Read the file and print its contents.
const fs = require('fs')

let gsr2 = 'MIIDujCCAqKgAwIBAgILBAAAAAABD4Ym5g0wDQYJKoZIhvcNAQEFBQAwTDEgMB4GA1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjIxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMDYxMjE1MDgwMDAwWhcNMjExMjE1MDgwMDAwWjBMMSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEGA1UEChMKR2xvYmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbPJA6+Lm8omUVCxKs+IVSbC9N/hHD6ErPLv4dfxn+G07IwXNb9rfF73OX4YJYJkhD10FPe+3t+c4isUoh7SqbKSaZeqKeMWhG8eoLrvozps6yWJQeXSpkqBy+0Hne/ig+1AnwblrjFuTosvNYSuetZfeLQBoZfXklqtTleiDTsvHgMCJiEbKjNS7SgfQx5TfC4LcshytVsW33hoCmEofnTlEnLJGKRILzdC9XZzPnqJworc5HGnRusyMvo4KD0L5CLTfuwNhv2GXqF4G3yYROIXJ/gkwpRl4pazq+r1feqCapgvdzZX99yqWATXgAByUr6P6TqBwMhAo6CygPCm48CAwEAAaOBnDCBmTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm+IHV2ccHsBqBt5ZtJot39wZhi4wNgYDVR0fBC8wLTAroCmgJ4YlaHR0cDovL2NybC5nbG9iYWxzaWduLm5ldC9yb290LXIyLmNybDAfBgNVHSMEGDAWgBSb4gdXZxwewGoG3lm0mi3f3BmGLjANBgkqhkiG9w0BAQUFAAOCAQEAmYFThxxol4aR7OBKuEQLq4GsJ0/WwbgcQ3izDJr86iw8bmEbTUsp9Z8FHSbBuOmDAGJFtqkIk7mpM0sYmsL4h4hO291xNBrBVNpGP+DTKqttVCL1OmLNIG+6KYnX3ZHu01yiPqFbQfXf5WRDLenVOavSot+3i9DAgBkcRcAtjOj4LaR0VknFBbVPFd5uRHg5h6h+u/N5GJG79G+dwfCMNYxdAfvDbbnvRG15RjF+Cv6pgsH/76tuIMRQyV+dTZsXjAzlAcmgQWpzU/qlULRuJQ/7TBj0/VLZjmmx6BEP3ojY+x1J96relc8geMJgEtslQIxq/H5COEBkEveegeGTLg==';

let hash = (alg, message) => {
	return crypto.createHash(alg).update(message).digest();
};

const getCertificateSubject = (certificate) => {
	let subjectCert = new jsrsasign.X509();
	subjectCert.readCertPEM(certificate);

	let subjectString = subjectCert.getSubjectString();
	let subjectFields = subjectString.slice(1).split('/');

	let fields = {};
	for (let field of subjectFields) {
		let kv = field.split('=');
		fields[kv[0]] = kv[1];
	}

	return fields;
};

const validateCertificatePath = (certificates) => {
	if ((new Set(certificates)).size !== certificates.length) {
		throw new Error('Failed to validate certificates path! Dublicate certificates detected!');
	}

	for (let i = 0; i < certificates.length; i++) {
		let subjectPem = certificates[i];
		let subjectCert = new jsrsasign.X509();
		subjectCert.readCertPEM(subjectPem);

		let issuerPem = '';
		if (i + 1 >= certificates.length) {
			issuerPem = subjectPem;
		}
		else {
			issuerPem = certificates[i + 1];
		}

		let issuerCert = new jsrsasign.X509();
		issuerCert.readCertPEM(issuerPem);

		if (subjectCert.getIssuerString() !== issuerCert.getSubjectString()) {
			throw new Error('Failed to validate certificate path! Issuers dont match!');
		}

		let subjectCertStruct = jsrsasign.ASN1HEX.getTLVbyList(subjectCert.hex, 0, [0]);
		let algorithm = subjectCert.getSignatureAlgorithmField();
		let signatureHex = subjectCert.getSignatureValueHex();

		let Signature = new jsrsasign.crypto.Signature({ alg: algorithm });
		Signature.init(issuerPem);
		Signature.updateHex(subjectCertStruct);

		if (!Signature.verify(signatureHex)) {
			throw new Error('Failed to validate certificate path!');
		};
	}

	return true;
};

function IsJsonString(str) {
	try {
		JSON.parse(str);
	}
	catch (e) {
		return false;
	}
	return true;
}

let verifySafetyNetAttestation = (webAuthnResponse, nonce) => {
	let attestationObject = webAuthnResponse;

	let jwsString = attestationObject.toString('utf8');
	let jwsParts = jwsString.split('.');

	if (!IsJsonString(base64url.decode(jwsParts[0]) || !IsJsonString(base64url.decode(jwsParts[1])))) {
		console.log('is not json string')
		return false;
	}

	let HEADER = JSON.parse(base64url.decode(jwsParts[0]));

	let PAYLOAD = JSON.parse(base64url.decode(jwsParts[1]));
	console.log(PAYLOAD);

	let SIGNATURE = jwsParts[2];
	// console.log(SIGNATURE);

	/* ----- Verify header ----- */
	let certPath = HEADER.x5c.concat([gsr2]).map((cert) => {
		let pemcert = '';
		for (let i = 0; i < cert.length; i += 64) {
			pemcert += cert.slice(i, i + 64) + '\n';
		}

		return '-----BEGIN CERTIFICATE-----\n' + pemcert + '-----END CERTIFICATE-----';
	});

	if (getCertificateSubject(certPath[0]).CN !== 'attest.android.com') {
		throw new Error('The common name is not set to "attest.android.com"!');
	}

	validateCertificatePath(certPath);
	/* ----- Verify header ENDS ----- */

	/* ----- Verify signature ----- */
	let signatureBaseBuffer = Buffer.from(jwsParts[0] + '.' + jwsParts[1]);
	let certificate = certPath[0];
	let signatureBuffer = base64url.toBuffer(SIGNATURE);

	let signatureIsValid = crypto.createVerify('sha256')
		.update(signatureBaseBuffer)
		.verify(certificate, signatureBuffer);

	if (!signatureIsValid) {
		throw new Error('Failed to verify the signature!');
	}
	/* ----- Verify signature ENDS ----- */

	/* ----- Verify PAYLOAD ----- */
	// Read the apk certificate digest key from local txt file.
	apkCertificateDigestKey = fs.readFileSync('apkCertificateDigestKey.txt', 'utf8', function (err, data) {
		if (err) throw err;
		console.log(data)
		return data;
	});


	/* ----- Commented out to work in emulator ----- */
	if (!PAYLOAD.basicIntegrity) {
		console.log(`basicIntegrity is false`);
		return false;
	}

	if (base64url.decode(PAYLOAD.nonce) !== nonce) {
		console.log(`nonce doesn't match`);
		return false;
	}

	if (PAYLOAD.apkCertificateDigestSha256[0] != apkCertificateDigestKey) {
		console.log(`apkCertificateDigestSha256 doesn't match`);
		return false;
	}

	const timeMs = new Date().getTime();

	if (PAYLOAD.timestampMs + 600000 < timeMs) {
		return false;
	}
	/* ----- Verify PAYLOAD ENDS ----- */

	return true;
};

module.exports = { verifySafetyNetAttestation };
