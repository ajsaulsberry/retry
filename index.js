import { RxHR } from '@akanass/rx-http-request';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

async function getAndRetry(url, retryCount) {
  return RxHR.get(url).pipe(
    tap(output => {
      if (output.response.statusCode >= 400)
        throw new Error(`StatusCode: ${output.response.statusCode}`);
    }),
    catchError(error => {
      console.log('Tried ' + url + ' Got ' + error);
      return throwError(error);
    }),
    retry(retryCount),
  ).toPromise();
}

(async () => {
  try {
    const results = await getAndRetry('https://api.mocklets.com/mock68043/', 10);
    console.log(results.body);
  } catch (error) {
    console.log('Retries were exhausted before a successful response was received. :-(');
  }
})();
