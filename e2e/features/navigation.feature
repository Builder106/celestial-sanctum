Feature: Primary navigation routes between pages

  All five top-level routes (Visit, About, Watch & Listen, Calendar, Give)
  reachable from the header. Each loads its own SSR'd content + page title.

  Scenario: Visiting /visit from the nav loads the first-time-visitor page
    Given I am on the home page
    When I navigate to "Visit" from the main nav
    Then the URL is "/visit"
    And the page title contains "Plan Your Visit"
    And I see the heading "Come as you are"

  Scenario: Visiting /about from the nav loads the long-form page
    Given I am on the home page
    When I navigate to "About" from the main nav
    Then the URL is "/about"
    And the page title contains "About"
    And I see the heading "heavenly sanctuary"

  Scenario: Visiting /watch from the nav loads the media hub
    Given I am on the home page
    When I navigate to "Watch & Listen" from the main nav
    Then the URL is "/watch"
    And the page title contains "Watch"
    And I see the text "Sanctum Podcast"

  Scenario: Visiting /give from the nav loads the giving page
    Given I am on the home page
    When I navigate to "Give" from the main nav
    Then the URL is "/give"
    And the page title contains "Give"
