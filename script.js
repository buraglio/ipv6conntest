// IPv6 Connectivity Test Script
// cobbled together by buraglio@forwardingplane.net
// Apache 2.0 licensed https://www.apache.org/licenses/LICENSE-2.0.txt
// Use at your own peril. 

class IPv6Tester {
    constructor() {
        this.ipv4Address = null;
        this.ipv6Address = null;
        this.testResults = {
            ipv4Connectivity: false,
            ipv6Connectivity: false,
            ipv4DNS: false,
            ipv6DNS: false,
            dualStack: false,
            ipv6Large: false
        };
        this.testTimes = {
            ipv4DNS: 0,
            ipv6DNS: 0,
            dualStack: 0,
            ipv6Large: 0
        };
        this.score = 0;
        this.wellKnownSites = [
            { name: 'Google', domain: 'www.google.com', ipv4Url: 'https://www.google.com/favicon.ico', ipv6Url: 'https://ipv6.google.com/favicon.ico', hasIPv6: true },
            { name: 'Facebook', domain: 'www.facebook.com', ipv4Url: 'https://www.facebook.com/favicon.ico', ipv6Url: 'https://www.facebook.com/favicon.ico', hasIPv6: true },
            { name: 'YouTube', domain: 'www.youtube.com', ipv4Url: 'https://www.youtube.com/favicon.ico', ipv6Url: 'https://www.youtube.com/favicon.ico', hasIPv6: true },
            { name: 'Netflix', domain: 'www.netflix.com', ipv4Url: 'https://www.netflix.com/favicon.ico', ipv6Url: 'https://www.netflix.com/favicon.ico', hasIPv6: true },
            { name: 'Wikipedia', domain: 'www.wikipedia.org', ipv4Url: 'https://www.wikipedia.org/favicon.ico', ipv6Url: 'https://www.wikipedia.org/favicon.ico', hasIPv6: true },
            { name: 'GitHub', domain: 'github.com', ipv4Url: 'https://github.com/favicon.ico', ipv6Url: 'https://github.com/favicon.ico', hasIPv6: false },
            { name: 'Cloudflare', domain: 'www.cloudflare.com', ipv4Url: 'https://www.cloudflare.com/favicon.ico', ipv6Url: 'https://www.cloudflare.com/favicon.ico', hasIPv6: true },
            { name: 'Akamai', domain: 'www.akamai.com', ipv4Url: 'https://www.akamai.com/favicon.ico', ipv6Url: 'https://www.akamai.com/favicon.ico', hasIPv6: true },
            { name: 'Microsoft', domain: 'www.microsoft.com', ipv4Url: 'https://www.microsoft.com/favicon.ico', ipv6Url: 'https://www.microsoft.com/favicon.ico', hasIPv6: true },
            { name: 'Apple', domain: 'www.apple.com', ipv4Url: 'https://www.apple.com/favicon.ico', ipv6Url: 'https://www.apple.com/favicon.ico', hasIPv6: true },
            { name: 'Amazon', domain: 'www.amazon.com', ipv4Url: 'https://www.amazon.com/favicon.ico', ipv6Url: 'https://www.amazon.com/favicon.ico', hasIPv6: true },
            { name: 'Reddit', domain: 'www.reddit.com', ipv4Url: 'https://www.reddit.com/favicon.ico', ipv6Url: 'https://www.reddit.com/favicon.ico', hasIPv6: false },
            { name: 'Twitter/X', domain: 'twitter.com', ipv4Url: 'https://twitter.com/favicon.ico', ipv6Url: 'https://twitter.com/favicon.ico', hasIPv6: false },
            { name: 'LinkedIn', domain: 'www.linkedin.com', ipv4Url: 'https://www.linkedin.com/favicon.ico', ipv6Url: 'https://www.linkedin.com/favicon.ico', hasIPv6: true },
            { name: 'Cisco', domain: 'www.cisco.com', ipv4Url: 'https://www.cisco.com/favicon.ico', ipv6Url: 'https://www.cisco.com/favicon.ico', hasIPv6: true }
        ];
        this.siteTestResults = [];
    }

    async init() {
        this.displayBrowserInfo();
        this.setupExpandableTests();
        this.setupSitesTable();
        await this.runAllTests();
        this.setupRetestButton();
        this.setupSitesTestButton();
        this.setupFilterButtons();
        this.setupSortableColumns();
    }

    displayBrowserInfo() {
        document.getElementById('user-agent').textContent = navigator.userAgent;
        document.getElementById('platform').textContent = navigator.platform;
    }

    async runAllTests() {
        // Reset all test indicators
        this.resetTestIndicators();

        // Run tests in sequence
        await this.detectIPAddresses();
        await this.testConnectivity();
        await this.runDetailedTests();
        this.calculateScore();
    }

    resetTestIndicators() {
        const indicators = document.querySelectorAll('.status-indicator, .test-indicator');
        indicators.forEach(indicator => {
            indicator.className = indicator.classList.contains('status-indicator') ? 'status-indicator pending' : 'test-indicator pending';
        });
    }

    async detectIPAddresses() {
        // Detect IPv4 address
        try {
            const ipv4Data = await this.fetchWithTimeout('https://api.ipify.org?format=json', 5000);
            if (ipv4Data && ipv4Data.ip) {
                this.ipv4Address = ipv4Data.ip;
                document.getElementById('ipv4-address').textContent = this.ipv4Address;

                // Get ISP info for IPv4
                const ipv4Info = await this.getIPInfo(this.ipv4Address);
                if (ipv4Info && ipv4Info.org) {
                    document.getElementById('ipv4-isp').textContent = ipv4Info.org;
                } else {
                    document.getElementById('ipv4-isp').textContent = 'Unknown';
                }
            }
        } catch (error) {
            console.error('IPv4 detection failed:', error);
            document.getElementById('ipv4-address').textContent = 'Not detected';
            document.getElementById('ipv4-isp').textContent = 'N/A';
        }

        // Detect IPv6 address
        try {
            const ipv6Data = await this.fetchWithTimeout('https://api64.ipify.org?format=json', 5000);
            if (ipv6Data && ipv6Data.ip && this.isIPv6(ipv6Data.ip)) {
                this.ipv6Address = ipv6Data.ip;
                document.getElementById('ipv6-address').textContent = this.ipv6Address;

                // Get ISP info for IPv6
                const ipv6Info = await this.getIPInfo(this.ipv6Address);
                if (ipv6Info && ipv6Info.org) {
                    document.getElementById('ipv6-isp').textContent = ipv6Info.org;
                } else {
                    document.getElementById('ipv6-isp').textContent = 'Unknown';
                }
            } else {
                document.getElementById('ipv6-address').textContent = 'Not available';
                document.getElementById('ipv6-isp').textContent = 'N/A';
            }
        } catch (error) {
            console.error('IPv6 detection failed:', error);
            document.getElementById('ipv6-address').textContent = 'Not available';
            document.getElementById('ipv6-isp').textContent = 'N/A';
        }
    }

    async getIPInfo(ip) {
        try {
            const response = await this.fetchWithTimeout(`https://ipinfo.io/${ip}/json`, 5000);
            return response;
        } catch (error) {
            console.error('IP info fetch failed:', error);
            return null;
        }
    }

    isIPv6(ip) {
        return ip.includes(':');
    }

    async testConnectivity() {
        // Test IPv4 connectivity
        const ipv4Result = await this.testEndpoint('https://ipv4.icanhazip.com/', 'ipv4');
        this.testResults.ipv4Connectivity = ipv4Result;
        this.updateStatusIndicator('ipv4-status', ipv4Result);

        // Test IPv6 connectivity - only if we detected an IPv6 address
        let ipv6Result = false;
        if (this.ipv6Address && this.ipv6Address !== 'Not available') {
            ipv6Result = await this.testEndpoint('https://ipv6.icanhazip.com/', 'ipv6');
        } else {
            console.log('No IPv6 address detected, skipping IPv6 connectivity test');
        }
        this.testResults.ipv6Connectivity = ipv6Result;
        this.updateStatusIndicator('ipv6-status', ipv6Result);
    }

    async testEndpoint(url, type) {
        try {
            const response = await this.fetchWithTimeout(url, 5000);
            return response !== null;
        } catch (error) {
            console.error(`${type} connectivity test failed:`, error);
            return false;
        }
    }

    updateStatusIndicator(elementId, success) {
        const element = document.getElementById(elementId);
        const indicator = element.querySelector('.status-indicator');
        const resultSpan = element.querySelector('.status-result');

        if (success) {
            indicator.classList.remove('pending', 'failed');
            indicator.classList.add('success');
            resultSpan.textContent = 'Connected';
            resultSpan.className = 'status-result success';
        } else {
            indicator.classList.remove('pending', 'success');
            indicator.classList.add('failed');
            resultSpan.textContent = 'Not Available';
            resultSpan.className = 'status-result failed';
        }
    }

    async runDetailedTests() {
        // Test IPv4-only DNS
        const startIpv4 = performance.now();
        const ipv4DNS = await this.testDNS('ipv4-only');
        this.testTimes.ipv4DNS = performance.now() - startIpv4;
        this.testResults.ipv4DNS = ipv4DNS;
        this.updateTestResult('test-ipv4-dns', ipv4DNS, this.testTimes.ipv4DNS);

        // Test IPv6-only DNS - only if we have IPv6 connectivity
        let ipv6DNS = false;
        if (this.testResults.ipv6Connectivity) {
            const startIpv6 = performance.now();
            ipv6DNS = await this.testDNS('ipv6-only');
            this.testTimes.ipv6DNS = performance.now() - startIpv6;
        } else {
            console.log('No IPv6 connectivity, skipping IPv6-only DNS test');
            this.testTimes.ipv6DNS = 0;
        }
        this.testResults.ipv6DNS = ipv6DNS;
        this.updateTestResult('test-ipv6-dns', ipv6DNS, this.testTimes.ipv6DNS);

        // Test Dual Stack
        const startDual = performance.now();
        const dualStack = await this.testDNS('dual-stack');
        this.testTimes.dualStack = performance.now() - startDual;
        this.testResults.dualStack = dualStack;
        this.updateTestResult('test-dual-stack', dualStack, this.testTimes.dualStack);

        // Test IPv6 Large Packet (simulated by testing a resource)
        const startLarge = performance.now();
        const ipv6Large = await this.testIPv6LargePacket();
        this.testTimes.ipv6Large = performance.now() - startLarge;
        this.testResults.ipv6Large = ipv6Large;
        this.updateTestResult('test-ipv6-large', ipv6Large, this.testTimes.ipv6Large);
    }

    async testDNS(type) {
        // Use image loading to test connectivity without CORS issues
        const endpoints = {
            'ipv4-only': 'https://ipv4.google.com/favicon.ico',
            'ipv6-only': 'https://ipv6.google.com/favicon.ico',
            'dual-stack': 'https://www.google.com/favicon.ico'
        };

        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    img.src = '';
                    console.error(`${type} DNS test timed out`);
                    resolve(false);
                }
            }, 5000);

            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };

            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    // For IPv6-only tests, an error likely means no IPv6 connectivity
                    // The browser falls back to IPv4 for dual-stack, but ipv6.google.com
                    // should only resolve over IPv6
                    if (type === 'ipv6-only') {
                        console.log(`${type} DNS test - failed to load, likely no IPv6`);
                        resolve(false);
                    } else {
                        // For IPv4-only and dual-stack, network error after DNS may still mean success
                        console.log(`${type} DNS test - got network response`);
                        resolve(true);
                    }
                }
            };

            // Add cache buster to prevent caching issues
            img.src = endpoints[type] + '?t=' + Date.now();
        });
    }

    async testIPv6LargePacket() {
        // Simulate large packet test by attempting to load a larger resource over IPv6
        // In a real implementation, this would test MTU and fragmentation but we can't really do that stuff from a browser, as far as I know
        if (!this.testResults.ipv6Connectivity) {
            return false;
        }

        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    img.src = '';
                    console.error('IPv6 large packet test timed out');
                    resolve(false);
                }
            }, 5000);

            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };

            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    // Error on IPv6-only endpoint means no IPv6
                    console.error('IPv6 large packet test failed - no IPv6 connectivity');
                    resolve(false);
                }
            };

            // Add cache buster
            img.src = 'https://ipv6.google.com/favicon.ico?t=' + Date.now();
        });
    }

    updateTestResult(elementId, success, time) {
        const element = document.getElementById(elementId);
        const indicator = element.querySelector('.test-indicator');
        const statusSpan = element.querySelector('.test-status');
        const detailResult = element.querySelector('.detail-result');
        const detailTime = element.querySelector('.detail-time');

        if (success) {
            indicator.classList.remove('pending', 'failed');
            indicator.classList.add('success');
            statusSpan.textContent = 'Passed';
            statusSpan.className = 'test-status success';
            if (detailResult) detailResult.textContent = 'Success - Connection established';
        } else {
            indicator.classList.remove('pending', 'success');
            indicator.classList.add('failed');
            statusSpan.textContent = 'Failed';
            statusSpan.className = 'test-status failed';
            if (detailResult) detailResult.textContent = 'Failed - Could not establish connection';
        }

        if (detailTime && time !== undefined) {
            detailTime.textContent = `${time.toFixed(0)}ms`;
        }
    }
// Calculate the score in a sane-ish way
    calculateScore() {
        let score = 0;
        let maxScore = 10;

        // IPv4 connectivity: 2 points
        if (this.testResults.ipv4Connectivity) score += 2;

        // IPv6 connectivity: 3 points
        if (this.testResults.ipv6Connectivity) score += 3;

        // IPv4 DNS: 1 point
        if (this.testResults.ipv4DNS) score += 1;

        // IPv6 DNS: 2 points
        if (this.testResults.ipv6DNS) score += 2;

        // Dual Stack: 1 point
        if (this.testResults.dualStack) score += 1;

        // IPv6 Large Packet: 1 point
        if (this.testResults.ipv6Large) score += 1;

        this.score = score;

        // Update the UI
        document.getElementById('score-value').textContent = score;

        // Display appropriate message
        let message = '';
        if (score >= 9) {
            message = 'Excellent! Your network is fully ready for IPv6.';
        } else if (score >= 7) {
            message = 'Good! Your network has strong IPv6 support.';
        } else if (score >= 5) {
            message = 'Moderate. Your network has basic IPv6 capabilities.';
        } else if (score >= 3) {
            message = 'Limited. Your network has minimal IPv6 support.';
        } else {
            message = 'Poor. Your network lacks IPv6 connectivity. Check https://request.ipv6.army';
        }

        document.getElementById('score-message').textContent = message;
    }

    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse as JSON, if that fails, just return the response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('Request timed out:', url);
            } else {
                console.error('Fetch error:', error);
            }
            return null;
        }
    }

    setupRetestButton() {
        const retestBtn = document.getElementById('retest-btn');
        retestBtn.addEventListener('click', async () => {
            retestBtn.disabled = true;
            retestBtn.textContent = 'Testing...';

            await this.runAllTests();

            retestBtn.disabled = false;
            retestBtn.textContent = 'Run Tests Again';
        });
    }

    setupExpandableTests() {
        const expandableDivs = document.querySelectorAll('.test-item.expandable');
        expandableDivs.forEach(testItem => {
            const expandBtn = testItem.querySelector('.expand-btn');

            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                testItem.classList.toggle('expanded');
                if (testItem.classList.contains('expanded')) {
                    expandBtn.textContent = '▲';
                    expandBtn.setAttribute('aria-label', 'Hide details');
                } else {
                    expandBtn.textContent = '▼';
                    expandBtn.setAttribute('aria-label', 'Show details');
                }
            });
        });
    }

    setupSitesTable() {
        const tbody = document.getElementById('sites-table-body');
        tbody.innerHTML = this.wellKnownSites.map((site, index) => `
            <tr data-site-index="${index}" ${site.hasIPv6 === false ? 'class="no-ipv6-support"' : ''}>
                <td class="site-name">${site.name}<br><small>${site.domain}</small></td>
                <td class="status-cell ipv4-cell"><span class="site-status pending">Pending</span></td>
                <td class="status-cell ipv6-cell"><span class="site-status pending">Pending</span></td>
                <td class="details-cell">
                    <div class="latency-comparison">
                        <div class="latency-item ipv4-latency">IPv4: <span class="latency-value">--</span></div>
                        <div class="latency-item ipv6-latency">IPv6: <span class="latency-value">--</span></div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupSitesTestButton() {
        const testBtn = document.getElementById('test-sites-btn');
        testBtn.addEventListener('click', async () => {
            testBtn.disabled = true;
            testBtn.textContent = 'Testing...';
            await this.testAllSites();
            testBtn.disabled = false;
            testBtn.textContent = 'Test All Sites Again';
        });
    }

    setupFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter table rows
                const filter = btn.dataset.filter;
                const rows = document.querySelectorAll('#sites-table-body tr');

                rows.forEach(row => {
                    if (filter === 'all') {
                        row.style.display = '';
                    } else if (filter === 'passed') {
                        const hasPass = row.querySelector('.site-status.success');
                        row.style.display = hasPass ? '' : 'none';
                    } else if (filter === 'failed') {
                        const hasFail = row.querySelector('.site-status.failed');
                        row.style.display = hasFail ? '' : 'none';
                    }
                });
            });
        });
    }

    setupSortableColumns() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                this.sortSitesTable(sortBy);
            });
        });
    }

    sortSitesTable(sortBy) {
        const tbody = document.getElementById('sites-table-body');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.querySelector('.site-name').textContent.trim();
                const nameB = b.querySelector('.site-name').textContent.trim();
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'ipv4' || sortBy === 'ipv6') {
                const cellClass = sortBy === 'ipv4' ? '.ipv4-cell' : '.ipv6-cell';
                const statusA = a.querySelector(cellClass + ' .site-status').textContent;
                const statusB = b.querySelector(cellClass + ' .site-status').textContent;
                return statusB.localeCompare(statusA); // Sort passed first
            }
            return 0;
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    async testAllSites() {
        this.siteTestResults = [];
        let ipv4Passed = 0;
        let ipv6Passed = 0;

        for (let i = 0; i < this.wellKnownSites.length; i++) {
            const site = this.wellKnownSites[i];
            const row = document.querySelector(`tr[data-site-index="${i}"]`);

            // Test IPv4
            const ipv4Start = performance.now();
            const ipv4Result = await this.testSiteConnectivity(site.ipv4Url);
            const ipv4Time = performance.now() - ipv4Start;

            const ipv4Cell = row.querySelector('.ipv4-cell .site-status');
            if (ipv4Result) {
                ipv4Cell.textContent = 'Reachable';
                ipv4Cell.className = 'site-status success';
                ipv4Passed++;
            } else {
                ipv4Cell.textContent = 'Failed';
                ipv4Cell.className = 'site-status failed';
            }

            // Test IPv6 (only if site supports it AND user has IPv6)
            let ipv6Result = false;
            let ipv6Time = 0;
            const ipv6Cell = row.querySelector('.ipv6-cell .site-status');

            if (site.hasIPv6 === false) {
                // Site is known not to support IPv6
                ipv6Cell.textContent = 'Not Supported. Lame!';
                ipv6Cell.className = 'site-status pending';
            } else if (!this.testResults.ipv6Connectivity) {
                // User doesn't have IPv6 connectivity
                ipv6Cell.textContent = 'No IPv6 Available';
                ipv6Cell.className = 'site-status failed';
            } else {
                const ipv6Start = performance.now();
                ipv6Result = await this.testSiteConnectivity(site.ipv6Url);
                ipv6Time = performance.now() - ipv6Start;

                if (ipv6Result) {
                    ipv6Cell.textContent = 'Reachable';
                    ipv6Cell.className = 'site-status success';
                    ipv6Passed++;
                } else {
                    ipv6Cell.textContent = 'Failed';
                    ipv6Cell.className = 'site-status failed';
                }
            }

            // Update latency comparison
            const ipv4LatencyDiv = row.querySelector('.ipv4-latency');
            const ipv6LatencyDiv = row.querySelector('.ipv6-latency');
            const ipv4LatencyValue = ipv4LatencyDiv.querySelector('.latency-value');
            const ipv6LatencyValue = ipv6LatencyDiv.querySelector('.latency-value');

            if (site.hasIPv6 === false) {
                // Site doesn't support IPv6 - highlight in orange
                ipv4LatencyValue.textContent = `${ipv4Time.toFixed(0)}ms`;
                ipv6LatencyValue.textContent = 'Not Supported. Lame!';
                ipv6LatencyDiv.classList.add('latency-no-ipv6');
            } else if (!this.testResults.ipv6Connectivity) {
                // User doesn't have IPv6
                ipv4LatencyValue.textContent = `${ipv4Time.toFixed(0)}ms`;
                ipv6LatencyValue.textContent = 'No IPv6';
                ipv6LatencyDiv.classList.add('latency-no-ipv6');
            } else if (ipv4Result && ipv6Result) {
                ipv4LatencyValue.textContent = `${ipv4Time.toFixed(0)}ms`;
                ipv6LatencyValue.textContent = `${ipv6Time.toFixed(0)}ms`;

                // Highlight the faster one regardless of difference amount
                if (ipv4Time < ipv6Time) {
                    ipv4LatencyDiv.classList.add('latency-faster');
                    ipv6LatencyDiv.classList.add('latency-slower');
                    const diff = ((ipv6Time - ipv4Time) / ipv6Time * 100).toFixed(1);
                    ipv4LatencyValue.innerHTML += ` <span class="speed-difference">(${diff}% faster)</span>`;
                } else if (ipv6Time < ipv4Time) {
                    ipv6LatencyDiv.classList.add('latency-faster');
                    ipv4LatencyDiv.classList.add('latency-slower');
                    const diff = ((ipv4Time - ipv6Time) / ipv4Time * 100).toFixed(1);
                    ipv6LatencyValue.innerHTML += ` <span class="speed-difference">(${diff}% faster)</span>`;
                } else {
                    // Exact tie
                    ipv4LatencyDiv.classList.add('latency-slower');
                    ipv6LatencyDiv.classList.add('latency-slower');
                }
            } else if (ipv4Result) {
                ipv4LatencyValue.textContent = `${ipv4Time.toFixed(0)}ms`;
                ipv6LatencyValue.textContent = 'No IPv6';
                ipv6LatencyDiv.classList.add('latency-no-ipv6');
            } else if (ipv6Result) {
                ipv4LatencyValue.textContent = 'No IPv4';
                ipv6LatencyValue.textContent = `${ipv6Time.toFixed(0)}ms`;
                ipv4LatencyDiv.classList.add('latency-slower');
            } else {
                ipv4LatencyValue.textContent = 'Failed';
                ipv6LatencyValue.textContent = 'Failed';
            }

            this.siteTestResults.push({
                site: site.name,
                ipv4: ipv4Result,
                ipv6: ipv6Result,
                ipv4Time: ipv4Time,
                ipv6Time: ipv6Time
            });
        }

        // Update summary
        document.getElementById('ipv6-sites-count').textContent =
            `${ipv6Passed} / ${this.wellKnownSites.length}`;
        document.getElementById('ipv4-sites-count').textContent =
            `${ipv4Passed} / ${this.wellKnownSites.length}`;
    }

    async testSiteConnectivity(url) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    img.src = '';
                    resolve(false);
                }
            }, 3000);

            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };

            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    // For IPv6-specific URLs (ipv6.* hostnames), error means failure
                    // For general URLs, we can't be sure, so we'll be conservative
                    const isIPv6Specific = url.includes('ipv6.');
                    if (isIPv6Specific) {
                        console.log(`IPv6-specific URL failed: ${url}`);
                        resolve(false);
                    } else {
                        // For dual-stack sites, an error could mean the resource is missing
                        // but the site is reachable. We'll mark as success if we got any response.
                        // However, this is still unreliable, so we'll be conservative.
                        resolve(false);
                    }
                }
            };

            img.src = url + '?t=' + Date.now();
        });
    }
}

// Initialize the tester when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const tester = new IPv6Tester();
    tester.init();
});
