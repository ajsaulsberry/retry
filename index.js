import { RxHR } from '@akanass/rx-http-request';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
const ora = require('ora');

async function getAndRetry(url, retryCount) {
  return RxHR.get(url).pipe(
    tap(output => {
      if (output.response.statusCode >= 400)
        throw new Error('StatusCode: ' + output.response.statusCode);
        // No string interpolation because backticks in code can cause errors in Markdown parsers.
    }),
    catchError(error => {
      console.log('\nTried ' + url + ' Got ' + error);
      return throwError(error);
    }),
    retry(retryCount),
  ).toPromise();
}

(async () => {
  const options = { color: 'magenta', text: 'Attempting REST API call...' } //
  const spinner = ora(options).start();
  try {
    const results = await getAndRetry('https://api.mocklets.com/mock68043/', 1, spinner);
    spinner.succeed(results.response.body);
  }
  catch (error) {
    error => spinner.fail('Retries exhausted before successful response with error ' + error);
  }
  //spinner.stop();
})();
