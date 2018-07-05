<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

  <xsl:variable name="content" select="mlInformation"/>
  <xsl:variable name="berths" select="$content/berths"/>
  <xsl:variable name="meta" select="$content/metadata"/>
  <xsl:variable name="section" select="$content/section"/>
  <xsl:variable name="details" select="$meta/details"/>
  <xsl:variable name="facilities" select="$meta/facilities"/>
  <xsl:variable name="metaSubject" select="$meta/subject"/>
  <xsl:variable name="date" select="$meta/postdate"/>
  <xsl:variable name="year" select="substring($date, 1, 4)" />
  <xsl:variable name="day" select="substring($date, 7, 2)" />
  <xsl:variable name="month">
    <xsl:call-template name="numbertoThreeLetterName">
      <xsl:with-param name="monthNum">
        <xsl:value-of select="substring($date, 5, 2)" />
      </xsl:with-param>
    </xsl:call-template>
  </xsl:variable>
  <xsl:variable name="title" select="$meta/title" />
  <xsl:variable name="status" select="$meta/details/Status"/>
  <xsl:param name="stringLookups">
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
    <string language="en" key="Annual_No_Vessels">Annual Number of Vessels</string>
    <string language="en" key="Annual_TEU">Annual TEU</string>
    <string language="en" key="Annual_Tonnage">Annual Tonnage</string>
    <string language="en" key="breakBulk">Break Bulk</string>
    <string language="en" key="container">Container</string>
    <string language="en" key="country">Country</string>
    <string language="en" key="countryiso">Country ISO</string>
    <string language="en" key="CSI_Compliant">CSI Compliant</string>
    <string language="en" key="dry_bulk">Dry Bulk</string>
    <string language="en" key="dry_dock">Dry Dock</string>
    <string language="en" key="facilitytype">Facility Type</string>
    <string language="en" key="gas">Gas</string>
    <string language="en" key="ISPS_Compliant">ISPS Compliant</string>
    <string language="en" key="liquid">Liquid</string>
    <string language="en" key="associatedEquipments">Associated Equipment</string>
    <string language="en" key="Maximum_Draft">Maximum Draft</string>
    <string language="en" key="Max_Beam">Maximum Beam</string>
    <string language="en" key="Max_DWT">Maximum DWT</string>
    <string language="en" key="Max_LOA">Maximum LOA</string>
    <string language="en" key="mlWorldPortNumber">Master Port Number</string>
    <string language="en" key="mlUNLCODE">UN/LOCODE</string>
    <string language="en" key="multi_purpose">Multi Purpose</string>
    <string language="en" key="numberofrunways">Number of Runways</string>
    <string language="en" key="operators">Operators</string>
    <string language="en" key="passenger">Passenger</string>
    <string language="en" key="publishednotes">Published Notes</string>
    <string language="en" key="region">Region</string>
    <string language="en" key="roro">Roll On/Roll Off</string>
    <string language="en" key="subtype">Sub Type</string>
    <string language="en" key="title">Title</string>
    <string language="en" key="type">Type</string>
    <string language="en" key="UNCTAD_Code">UNCTAD Code</string>
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
  </xsl:param>

  <xsl:template match="/">
    <h1 class="page-header u-margin-Bm u-margin-Ts u-padding-Bs">
      <xsl:value-of select="$title"/>
      <xsl:if test="$status = 'Closed'">
        [<xsl:value-of select="$status"/>]
      </xsl:if>
    </h1>

    <!-- Container -->
    <div class="grid-container" style="margin-left:5px;">
      <div class="grid">
        <div class="grid-1 grid-md-1-4">
          <!-- Table Of Contents -->
          <div class="panel panel-default">
            <div class="panel-heading">
              Contents
            </div>
            <ul class="list-group">
              <li class="list-group-item">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="'#DetailsPanel'" />
                  </xsl:attribute>
                  Port Details
                </a>
              </li>
              <li class="list-group-item">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="'#FacilitiesPanel'" />
                  </xsl:attribute>
                  Facilities
                </a>
              </li>
              <xsl:for-each select="//title[parent::*[local-name()='section' or local-name()='subsection']]">
                <xsl:apply-templates select="." mode="toc" />
              </xsl:for-each>

              <!-- Add berth to table of contents -->
              <li class="list-group-item">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="'#Berths'" />
                  </xsl:attribute>
                  Berths
                </a>
              </li>
              <xsl:apply-templates select="//name[parent::*[local-name()='berth']]" mode="toc"/>
            </ul>
          </div>
        </div>
        <div class="grid-1 grid-md-3-4">
          <!-- Main Content -->
          <div class="grid">
            <div class="grid-1-1">
              <div class="panel panel-default">
                <div class="panel-heading">
                  <a href="#DetailsPanel" name="DetailsPanel">
                    <xsl:value-of select="concat('Port Details - Port ID: ', $details/Port_ID)"/>
                  </a>
                </div>
                <div class="panel-body">
                  <xsl:call-template name="recordDetails">
                    <xsl:with-param name="details" select="$details"/>
                  </xsl:call-template>
                </div>
              </div>
            </div>
            <div class="grid-1-1">
              <!-- Facilities -->
              <div class="panel panel-default">
                <div class="panel-heading">
                  <a href="#FacilitiesPanel" name="FacilitiesPanel">
                    Facilities
                  </a>
                </div>
                <div class="panel-body">
                  <xsl:apply-templates select="$facilities" mode="header"/>
                </div>
              </div>

            </div>
            <div class="grid-1-1">
              <div class="panel panel-default">
                <div class="panel-heading">
                  <xsl:value-of select="concat($title, ' ' )"/>
                  <span style="color:#f7941d;margin-right:10px;">
                    <xsl:value-of select="$meta/postdate"/>
                  </span>
                  <span style="color:#777;font-size:90%">
                    <xsl:value-of select="$meta/country[1]/region[1]/standardName[1]"/>
                  </span>
                </div>
                <div class="panel-body">
                  <div id="main-content">
                    <xsl:apply-templates/>
                    <xsl:apply-templates mode="berths" select="$meta/berths[1]"/>
                    <xsl:apply-templates mode="berths" select="$meta/berths/berth"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="title" mode="toc">
    <xsl:choose>
      <xsl:when test="parent::*[local-name()='section']">
        <li class="list-group-item">
          <xsl:call-template name="sideNavLevel">
            <xsl:with-param name="level">1</xsl:with-param>
          </xsl:call-template>
        </li>
      </xsl:when>
      <xsl:when test="parent::*[local-name()='subsection']">
        <li class="list-group-item sub">
          <i class="icon-angle-right"></i>
          <xsl:call-template name="sideNavLevel">
            <xsl:with-param name="level">2</xsl:with-param>
          </xsl:call-template>
        </li>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template match="name" mode="toc">
    <li class="list-group-item sub">
      <i class="icon-angle-right"></i>
      <xsl:call-template name="sideNavLevel">
        <xsl:with-param name="level">2</xsl:with-param>
      </xsl:call-template>
    </li>
  </xsl:template>

  <xsl:template name="sideNavLevel">
    <xsl:param name="level">1</xsl:param>
    <a>
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', normalize-space() )" />
      </xsl:attribute>
      <xsl:value-of select="normalize-space()"/>
    </a>
  </xsl:template>

  <xsl:template match="section">
    <div>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="berths" mode="berths">
    <a class="h2" style="font-weight:bold;">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', 'Berths')" />
      </xsl:attribute>
      <xsl:attribute name="name">
        <xsl:value-of select="'Berths'"/>
      </xsl:attribute>
      <xsl:value-of select="'Berths'"/>
    </a>
    <p class="para"></p>
  </xsl:template>

  <xsl:template match="//berth[ancestor::berths]" mode="berths">
    <xsl:param name="lat" select="lat"/>
    <xsl:param name="lon" select="lon"/>
    <div>
      <a class="h4" style="font-weight:bold;">
        <xsl:attribute name="href">
          <xsl:value-of select="concat('#', name)" />
        </xsl:attribute>
        <xsl:attribute name="name">
          <xsl:value-of select="name"/>
        </xsl:attribute>
        <xsl:value-of select="name"/>
      </a>
      <p class="para"></p>
      <div class="table-responsive">
        <table class="table table-bordered  table-hover table-condensed">
          <tr>
            <th>ID</th>
            <td>
              <xsl:value-of select="id"/>
            </td>
          </tr>
          <tr>
            <th>Name</th>
            <td>
              <xsl:value-of select="name"/>
            </td>
          </tr>
          <tr>
            <th>Facility Type</th>
            <td>
              <xsl:value-of select="facility_type"/>
            </td>
          </tr>
          <tr>
            <th>Terminal</th>
            <td>
              <xsl:value-of select="terminal_name"/>
            </td>
          </tr>
          <tr>
            <th>Coords</th>
            <td>
              <xsl:choose>
                <xsl:when test="$lat = 0 or $lon = 0">
                  Unknown
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="concat(lat, ' ', lon)"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="//title[ancestor::section]">
    <a class="h2" style="font-weight:bold;">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', .)" />
      </xsl:attribute>
      <xsl:attribute name="name">
        <xsl:value-of select="."/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </a>
  </xsl:template>

  <xsl:template match="//title[ancestor::subsection]">
    <a class="h4">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', .)" />
      </xsl:attribute>
      <xsl:attribute name="name">
        <xsl:value-of select="."/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </a>
  </xsl:template>

  <xsl:template match="subsection" >
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="paragraph">
    <div>
      <xsl:apply-templates select="text()|*"/>
    </div>
  </xsl:template>

  <xsl:template match="text()">
    <p class="para">
      <xsl:value-of select="." disable-output-escaping="yes"/>
    </p>
  </xsl:template>

  <xsl:template match="Table">
    <div class="table-responsive">
      <table class="table table-bordered  table-hover table-condensed">
        <xsl:apply-templates/>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="tr">
    <tr>
      <xsl:apply-templates/>
    </tr>
  </xsl:template>

  <xsl:template match="td">
    <td>
      <xsl:attribute name="colspan">
        berth
        <xsl:value-of select="./@colspan"/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </td>
  </xsl:template>

  <xsl:template match="facilities|details|metadata">

  </xsl:template>

  <xsl:template name="label">
    <xsl:param name="text" />
    <xsl:element name="div">
      <xsl:attribute name="class">u-padding-Bxxs</xsl:attribute>
      <xsl:choose>
        <xsl:when test="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']">
          <xsl:value-of select="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$text"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text>:&#160;</xsl:text>
    </xsl:element>
  </xsl:template>

  <xsl:template name="facility">
    <xsl:param name="facility"/>
    <xsl:param name="name"/>
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">
      <xsl:value-of select="$name"/>
    </p>
    <p>
      <xsl:choose>
        <xsl:when test="$facility = 'true'">
          Yes
        </xsl:when>
        <xsl:otherwise>
          No
        </xsl:otherwise>
      </xsl:choose>
    </p>

  </xsl:template>

  <xsl:template match="facilities" mode="header">
    <xsl:param name="facilities"/>

    <div class="grid">
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="breakBulk"/>
          <xsl:with-param name="name" select="'Break Bulk'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="container"/>
          <xsl:with-param name="name" select="'Container'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="dry_bulk"/>
          <xsl:with-param name="name" select="'Dry Bulk'"/>
        </xsl:call-template>
      </div>
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="liquid"/>
          <xsl:with-param name="name" select="'Liquid'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="gas"/>
          <xsl:with-param name="name" select="'Gas'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="roro"/>
          <xsl:with-param name="name" select="'Roll On/Roll Off'"/>
        </xsl:call-template>
      </div>
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="passenger"/>
          <xsl:with-param name="name" select="'Passenger'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="multi_purpose"/>
          <xsl:with-param name="name" select="'Multi-Purpose'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="dry_dock"/>
          <xsl:with-param name="name" select="'Dry Dock'"/>
        </xsl:call-template>
      </div>
    </div>
  </xsl:template>

  <xsl:template name="recordDetails">
    <xsl:param name="details"/>

    <div class="grid">
      <div class="grid-1-4">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Status</p>
        <p>
          <xsl:value-of select="$details/Status"/>
        </p>

        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Compliance</p>
        <xsl:if test="$details/ISPS_Compliant = 'true'">
          <p>ISPS</p>
        </xsl:if>
        <xsl:if test="$details/CSI_Compliant = 'true'">
          <p>CSI</p>
        </xsl:if>
        <xsl:if test="$details/CSI_Compliant != 'true' and $details/ISPS_Compliant != 'true'">
          <p>None</p>
        </xsl:if>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max DWT</p>
        <p>
          <xsl:value-of select="$details/Max_DWT"/>
        </p>
      </div>
      <div class="grid-1-4">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">UNL Code</p>
        <p>
          <xsl:choose>
            <xsl:when test="$details/UNCTAD_Code">
              <xsl:value-of select="$details/UNCTAD_Code"/>
            </xsl:when>
            <xsl:otherwise>
              Unknown
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">MaxDraft</p>
        <p>
          <xsl:value-of select="$details/Maximum_Draft"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Tonnage</p>
        <p>
          <xsl:value-of select="$details/Annual_Tonnage"/>
        </p>

      </div>
      <div class="grid-1-4">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Number of Pax</p>
        <p>
          <xsl:value-of select="$details/Annual_no_Pax"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Number of Vessels</p>
        <p>
          <xsl:value-of select="$details/Annual_No_Vessels"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual TEU</p>
        <p>
          <xsl:value-of select="$details/Annual_TEU"/>
        </p>
      </div>
      <div class="grid-1-4">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Coords</p>
        <p>
          <xsl:value-of select="concat($details/Latitude, ' ', $details/Longitude)"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max LOA</p>
        <p>
          <xsl:value-of select="$details/Max_LOA"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max_Beam</p>
        <p>
          <xsl:value-of select="$details/Max_Beam"/>
        </p>
      </div>
    </div>


  </xsl:template>

  <xsl:template name="numbertoThreeLetterName">
    <xsl:param name="monthNum" />
    <xsl:choose>
      <xsl:when test="$monthNum = '1' or $monthNum = '01'">
        <xsl:text>Jan</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '2' or $monthNum = '02'">
        <xsl:text>Feb</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '3' or $monthNum = '03'">
        <xsl:text>Mar</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '4' or $monthNum = '04'">
        <xsl:text>Apr</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '5' or $monthNum = '05'">
        <xsl:text>May</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '6' or $monthNum = '06'">
        <xsl:text>Jun</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '7' or $monthNum = '07'">
        <xsl:text>Jul</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '8' or $monthNum = '08'">
        <xsl:text>Aug</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '9' or $monthNum = '09'">
        <xsl:text>Sep</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '10'">
        <xsl:text>Oct</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '11'">
        <xsl:text>Nov</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '12'">
        <xsl:text>Dec</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$monthNum"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
