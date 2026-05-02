# AuthenticationApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createActionRequest**](#createactionrequest) | **POST** /auth/action-requests | Creates an Auth Action Request|
|[**createToken**](#createtoken) | **POST** /auth/tokens | Creates an Auth Token|
|[**deleteRefreshTokenCookies**](#deleterefreshtokencookies) | **DELETE** /auth/refresh-token-cookies | Destroys the refresh-token cookie|
|[**getActionRequest**](#getactionrequest) | **GET** /auth/action-requests/{requestId} | Returns an Auth Action Request|

# **createActionRequest**
> ActionRequestResponse createActionRequest(actionRequestPostRequest)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ActionRequestPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let actionRequestPostRequest: ActionRequestPostRequest; //

const { status, data } = await apiInstance.createActionRequest(
    actionRequestPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **actionRequestPostRequest** | **ActionRequestPostRequest**|  | |


### Return type

**ActionRequestResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | Accepted |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createToken**
> AuthTokenResponse createToken(authTokenPostRequest)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    AuthTokenPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let authTokenPostRequest: AuthTokenPostRequest; //
let authContext: 'browser'; //When set to `browser`, the refresh token will be returned as an HttpOnly `Set-Cookie` header instead of in the response body, and the `refreshToken` field will be omitted from the JSON response.  (optional) (default to undefined)
let refreshToken: string; //An existing refresh token cookie (sent automatically by the browser). Used to refresh an existing session when re-authenticating in browser context.  (optional) (default to undefined)

const { status, data } = await apiInstance.createToken(
    authTokenPostRequest,
    authContext,
    refreshToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authTokenPostRequest** | **AuthTokenPostRequest**|  | |
| **authContext** | [**&#39;browser&#39;**]**Array<&#39;browser&#39;>** | When set to &#x60;browser&#x60;, the refresh token will be returned as an HttpOnly &#x60;Set-Cookie&#x60; header instead of in the response body, and the &#x60;refreshToken&#x60; field will be omitted from the JSON response.  | (optional) defaults to undefined|
| **refreshToken** | [**string**] | An existing refresh token cookie (sent automatically by the browser). Used to refresh an existing session when re-authenticating in browser context.  | (optional) defaults to undefined|


### Return type

**AuthTokenResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Token created successfully. When &#x60;auth-context: browser&#x60; is provided, the &#x60;refreshToken&#x60; field is omitted from the body and instead returned as an HttpOnly &#x60;Set-Cookie&#x60; header.  |  * Set-Cookie - Only present when &#x60;auth-context: browser&#x60;. Sets an HttpOnly &#x60;refresh-token&#x60; cookie scoped to &#x60;/v1/auth/tokens&#x60;.  <br>  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteRefreshTokenCookies**
> deleteRefreshTokenCookies()

Clears the HttpOnly `refresh-token` cookie by issuing a `Set-Cookie` header with an expired max-age. Should be called on logout when the browser context is in use. 

### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.deleteRefreshTokenCookies();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Cookie cleared successfully. |  * Set-Cookie - Expires the &#x60;refresh-token&#x60; cookie. <br>  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getActionRequest**
> ActionRequestResponse getActionRequest()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let requestId: string; // (default to undefined)

const { status, data } = await apiInstance.getActionRequest(
    requestId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestId** | [**string**] |  | defaults to undefined|


### Return type

**ActionRequestResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

