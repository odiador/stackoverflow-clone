#include <bits/stdc++.h>
using namespace std;

// Typedefs
using ll = long long;
using ull = unsigned long long;
using ld = long double;
using uint = unsigned int;
using pii = pair<int, int>;
using pli = pair<ll, int>;
using pll = pair<ll, ll>;
using vll = vector<ll>;
using vi = vector<int>;
using vii = vector<pii>;
using vc = vector<char>;

typedef set<int>::iterator sit;
typedef map<int, int>::iterator mit;
typedef vector<int>::iterator vit;
typedef vector<long long int>::iterator vllit;

// Constants
const ll INF = 1e18;
const int INF_INT = 1e9 + 7;
const int MOD = 1e9 + 7;
const int MAXN = 1e6 + 3;

// Macros
#define all(x) (x).begin(), (x).end()
#define pb push_back
#define mp make_pair
#define fi first
#define se second

#define _ % MOD
#define __ %= MOD

#define each(it, s) for (vit it = (s).begin(); it != (s).end(); ++it)
#define sortA(v) sort((v).begin(), (v).end())
#define sortD(v) sort((v).begin(), (v).end(), greater<typename decltype(v)::value_type>())
#define fill0(a) memset(a, 0, sizeof(a))

#define rep(i, n) for (int i = 0; i < (n); ++i)
#define repA(i, a, n) for (int i = (a); i <= (n); ++i)
#define repD(i, a, n) for (int i = (a); i >= (n); --i)
#define pq(x) priority_queue<x, vector<x>, greater<x>>
#define rpq(x) priority_queue<x, vector<x>, less<x>>

ll gcd(ll a, ll b) { return b == 0 ? a : gcd(b, a % b); }

clock_t startTime;
double getCurrentTime() {
    return (double)(clock() - startTime) / CLOCKS_PER_SEC;
}

void solve() {
    int n;
    cin >> n;
    int maximum = INT_MIN;
    int counter = 0, j;

    for (int i = 0; i < n; i++) {
        cin >> j;
        maximum = max(maximum, j);
        counter += j;
    }

    int teams = counter / 3;

    if (maximum > teams) {
        cout << "NO"<<endl;
        return;
    }

    cout << "YES"<<endl;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(0);
#ifdef DEBUG
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
#endif
    solve();
    return 0;
}
