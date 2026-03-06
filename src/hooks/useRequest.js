import { useState } from "react"

export const useRequest = (apiFn) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const run = async (...args) => {
		setLoading(true);
		setError(null);

		try {
			const res = await apiFn(...args);
			setData(res);
			return res;
		} catch (err) {
			setError(err.response?.data?.message || "Request failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};

  	return { data, loading, error, run };
};
