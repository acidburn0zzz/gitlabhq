module gitlab.com/gitlab-org/gitlab/workhorse

go 1.25.0

require (
	github.com/Azure/azure-storage-blob-go v0.13.0
	github.com/BurntSushi/toml v0.3.1
	github.com/FZambia/sentinel v1.0.0
	github.com/alecthomas/chroma v0.7.3
	github.com/aws/aws-sdk-go v1.38.35
	github.com/disintegration/imaging v1.6.2
	github.com/getsentry/raven-go v0.2.0
	github.com/golang-jwt/jwt/v4 v4.5.2
	github.com/golang/gddo v0.0.0-20190419222130-af0f2af80721
	github.com/golang/protobuf v1.5.4
	github.com/gomodule/redigo v2.0.0+incompatible
	github.com/gorilla/websocket v1.5.3
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0
	github.com/johannesboyne/gofakes3 v0.0.0-20200510090907-02d71f533bec
	github.com/jpillora/backoff v1.0.0
	github.com/mitchellh/copystructure v1.0.0
	github.com/prometheus/client_golang v1.11.1
	github.com/rafaeljusto/redigomock v0.0.0-20190202135759-257e089e14a1
	github.com/sebest/xff v0.0.0-20210106013422-671bd2870b3a
	github.com/sirupsen/logrus v1.8.3
	github.com/smartystreets/goconvey v1.6.4
	github.com/stretchr/testify v1.7.0
	gitlab.com/gitlab-org/gitaly/v14 v14.3.0-rc2.0.20211007055622-df7dadcc3f74
	gitlab.com/gitlab-org/golang-archive-zip v0.1.1
	gitlab.com/gitlab-org/labkit v1.6.0
	gocloud.dev v0.23.0
	golang.org/x/image v0.41.0
	golang.org/x/lint v0.0.0-20201208152925-83fdc39ff7b5
	golang.org/x/net v0.53.0
	golang.org/x/tools v0.44.0
	google.golang.org/grpc v1.82.1
	honnef.co/go/tools v0.1.3
)

require (
	cloud.google.com/go v0.81.0 // indirect
	contrib.go.opencensus.io/exporter/stackdriver v0.13.8 // indirect
	github.com/Azure/azure-pipeline-go v0.2.3 // indirect
	github.com/Azure/go-autorest v14.2.0+incompatible // indirect
	github.com/Azure/go-autorest/autorest v0.11.18 // indirect
	github.com/Azure/go-autorest/autorest/adal v0.9.13 // indirect
	github.com/Azure/go-autorest/autorest/date v0.3.0 // indirect
	github.com/Azure/go-autorest/logger v0.2.1 // indirect
	github.com/Azure/go-autorest/tracing v0.6.0 // indirect
	github.com/DataDog/datadog-go v4.4.0+incompatible // indirect
	github.com/Microsoft/go-winio v0.4.19 // indirect
	github.com/StackExchange/wmi v0.0.0-20190523213315-cbe66965904d // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/census-instrumentation/opencensus-proto v0.3.0 // indirect
	github.com/certifi/gocertifi v0.0.0-20200922220541-2c3bb06c6054 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/client9/reopen v1.0.0 // indirect
	github.com/danwakefield/fnmatch v0.0.0-20160403171240-cbb64ac3d964 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dlclark/regexp2 v1.2.0 // indirect
	github.com/form3tech-oss/jwt-go v3.2.2+incompatible // indirect
	github.com/go-ole/go-ole v1.2.4 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/google/pprof v0.0.0-20210226084205-cbba55b83ad5 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/google/wire v0.5.0 // indirect
	github.com/googleapis/gax-go/v2 v2.0.5 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20181017120253-0766667cb4d1 // indirect
	github.com/hashicorp/yamux v0.0.0-20210316155119-a95892c5f864 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/jtolds/gls v4.20.0+incompatible // indirect
	github.com/lightstep/lightstep-tracer-common/golang/gogo v0.0.0-20210210170715-a8dfcb80d3a7 // indirect
	github.com/lightstep/lightstep-tracer-go v0.24.0 // indirect
	github.com/mattn/go-ieproxy v0.0.1 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.1 // indirect
	github.com/mitchellh/reflectwalk v1.0.0 // indirect
	github.com/oklog/ulid/v2 v2.0.2 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/philhofer/fwd v1.0.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.26.0 // indirect
	github.com/prometheus/procfs v0.6.0 // indirect
	github.com/ryszard/goskiplist v0.0.0-20150312221310-2dfbae5fcf46 // indirect
	github.com/shabbyrobe/gocovmerge v0.0.0-20190829150210-3e036491d500 // indirect
	github.com/shirou/gopsutil v2.20.1+incompatible // indirect
	github.com/smartystreets/assertions v0.0.0-20180927180507-b2de0cb4f26d // indirect
	github.com/tinylib/msgp v1.1.2 // indirect
	github.com/uber/jaeger-client-go v2.27.0+incompatible // indirect
	github.com/uber/jaeger-lib v2.4.1+incompatible // indirect
	go.opencensus.io v0.23.0 // indirect
	go.uber.org/atomic v1.7.0 // indirect
	golang.org/x/crypto v0.50.0 // indirect
	golang.org/x/mod v0.35.0 // indirect
	golang.org/x/oauth2 v0.36.0 // indirect
	golang.org/x/sync v0.20.0 // indirect
	golang.org/x/sys v0.43.0 // indirect
	golang.org/x/telemetry v0.0.0-20260409153401-be6f6cb8b1fa // indirect
	golang.org/x/text v0.37.0 // indirect
	golang.org/x/time v0.0.0-20210220033141-f8bda1e9f3ba // indirect
	golang.org/x/tools/go/expect v0.1.1-deprecated // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/api v0.46.0 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/genproto v0.0.0-20210506142907-4a47615972c2 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
	gopkg.in/DataDog/dd-trace-go.v1 v1.31.0 // indirect
	gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c // indirect
)
