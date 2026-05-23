Feature: Footer renders parish contact info site-wide

  The footer is rendered on every page via SanityService → csSiteSettings.
  Address, phone, and email should appear identically across routes.

  Scenario: Footer on the home page shows the parish address
    Given I am on the home page
    Then the footer shows the parish address

  Scenario: Footer on the about page shows the same parish address
    Given I am on the "/about" page
    Then the footer shows the parish address

  Scenario: Footer on the watch page shows the same parish address
    Given I am on the "/watch" page
    Then the footer shows the parish address
