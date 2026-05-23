Feature: Warmup

  Two throwaway scenarios that absorb the first-test-slot 0-byte video bug
  Playwright has under single-worker + slowMo + video=on. The custom
  reporter detects these by the "00-warmup" slug prefix and discards
  their per-test folders. Two is the floor; one is sometimes not enough.

  Scenario: Warmup A
    Given I am on the home page

  Scenario: Warmup B
    Given I am on the home page
