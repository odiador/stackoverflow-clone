#include <bits/stdc++.h>
using namespace std;
int main()
{
    cin.tie(0);
    ios::sync_with_stdio(false);
    int n, x, cnt = 0;
    cin >> n;
    for (int i = 0; i < n; i++)
    {
        cin >> x;
        if (x % 2 == 1)
            cnt++;
    }
    cout << cnt << endl;
    return 0;
}