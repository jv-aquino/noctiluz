export function returnParams(params: {}) {
  return {
      params: new Promise((resolve) => {
          resolve(params);
      }),
  };
}