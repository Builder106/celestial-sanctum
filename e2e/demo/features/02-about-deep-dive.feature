Feature: Visitor explores the parish's identity

  Narrative walkthrough of /about — the long-form scrolling page that holds
  the parish's story, mission, doctrine, mode of worship, ministries, and
  choir. Demos the sticky right-rail TOC and the Sanity-driven sections.

  Scenario: Visitor reads the parish story end-to-end
    Given I am on the home page
    When I pause for narration
    When I navigate to "About" from the main nav
    Then I see the heading "heavenly sanctuary"
    When I pause for narration
    And I scroll to the "story" section
    When I scroll to the "mission" section
    When I scroll to the "doctrine" section
    When I scroll to the "mode-of-worship" section
    When I scroll to the "ministries" section
    When I scroll to the "choir" section
    And I pause for narration
