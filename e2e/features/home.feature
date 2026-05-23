Feature: Home page renders core parish content

  The homepage is the highest-traffic surface and pulls content from Sanity.
  These scenarios verify the SSR-prerendered HTML actually contains the
  parish identity (not the FALLBACK placeholders) and the expected sections.

  Scenario: Home loads with the parish hero
    Given I am on the home page
    Then I see the heading "Sanctum parish"
    And I see the text "Plan Your Visit"
    And I see the text "Celestial Church of Christ"
    And the page title contains "Celestial Sanctum Parish"

  Scenario: Home shows the mission quote and Sunday rhythm
    Given I am on the home page
    Then I see the text "win and nurture souls"
    And I see the text "Arrive"
    And I see the text "Worship"
    And I see the text "Fellowship"

  Scenario: Home shows the pastor's letter and closing CTAs
    Given I am on the home page
    Then I see the text "This is your house"
    And I see the text "Find us in Bloomington"
    And I see the text "Get Directions"
