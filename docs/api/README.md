# API contract snapshots

이 디렉터리는 Context 저장소가 소유하는 OpenAPI 계약의 Web용 snapshot이다.

- `open-api.yaml`은 `context/openapi/core-api.yaml`의 복제본이다.
- `compute-api.yaml`은 Core 계약에서 참조하는 공통 schema의 `$ref`를 해석하기 위한
  `context/openapi/compute-api.yaml` 복제본이다.

Web은 `open-api.yaml`에 정의된 Core API만 호출한다. `compute-api.yaml`을 함께 두는 것은
계약 문서의 참조를 완결하기 위한 것이며, Compute API 직접 호출을 허용하지 않는다.

계약 변경이 필요하면 Context 정본을 먼저 변경하고 snapshot을 갱신한 뒤 다음 명령으로 확인한다.

```powershell
./scripts/verify-context-contract-sync.ps1
```
