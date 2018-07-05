<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE stylesheet [
    <!ENTITY copy             "&#x000A9;" >    <!--COPYRIGHT SIGN -->
    <!ENTITY nbsp             "&#x000A0;" >    <!--NO-BREAK SPACE -->
]>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">
    <xsl:output method="html" indent="yes"/>

    <xsl:template match="root">
        <html>
            <head>
                <title>
                    <xsl:value-of select="TITLE"/>
                </title>
                <xsl:for-each select="*">
                    <xsl:if test="not(starts-with(local-name(), 'XXX_')) and not(local-name() = 'TITLE')">
                        <META>
                            <xsl:attribute name="NAME">
                                <xsl:value-of select="@Caption"/>
                            </xsl:attribute>
                            <xsl:attribute name="CONTENT">
                                <xsl:value-of select="."/>
                            </xsl:attribute>
                        </META>
                    </xsl:if>
                </xsl:for-each>
                <link rel="stylesheet" href="jds.css"/>
            </head>
            <body bgcolor="#DDDDDD" text="#000000" link="#0000FF" vlink="#FF0000" alink="#00AA00">
                <center>
                    <img src="html.jpg" border="0"/>
                </center>
                <strong>
                    <!-- COUNTRY -->
                    <xsl:value-of select="COUNTRYREFERENCES"/>
                    <!-- /COUNTRY -->
                    <xsl:text>&nbsp;</xsl:text>
                    <!-- GROUP_AGENCY_REGION -->
                    <xsl:value-of select="REGIONREFERENCES"/>
                    <!-- /GROUP_AGENCY_REGION -->
                </strong>
                <p align="right">
                    <strong>
                        <font size="-1">
                            <b>
                                <xsl:text>Date Posted:&nbsp;</xsl:text>
                                <!-- DATE -->
                                <xsl:value-of select="DATEOFEVENT"/>
                                <!-- /DATE -->
                            </b>
                        </font>
                    </strong>
                </p>
                <center>
                    <font size="-1">
                        <xsl:text>Jane's Terrorism and Insurgency Centre</xsl:text>
                    </font>
                </center>
                <hr/>
                <p>
                    <b>
                        <!-- TITLE -->
                        <xsl:value-of select="DOCUMENTTITLE"/>
                        <!-- /TITLE -->
                    </b>
                </p>
                <!-- TEXT -->
                <xsl:value-of select="XXX_FULLRECORDSUMMARY"/>
                <!-- /TEXT -->
                <p>
                    <xsl:text>&nbsp;</xsl:text>
                </p>
                <table border="1">
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">LOCATIONOFATTACKCOUNTRY</xsl:with-param>
                        <xsl:with-param name="title">Country Affected</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">LOCATIONOFATTACKREGION</xsl:with-param>
                        <xsl:with-param name="title">Region Affected</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">DATEOFEVENT</xsl:with-param>
                        <xsl:with-param name="title">Date of Event</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TERRORISTGROUPNAME</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Group Name</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TERRORISTGROUPTYPE</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Group Type</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TERRORISTGROUPREGIONOFORIGIN</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Group Region of Origin</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TERRORISTGROUPCOUNTRYOFORIGIN</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Group Country of Origin</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">LOCATIONREGION</xsl:with-param>
                        <xsl:with-param name="title">1 Location of Event - Region</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="IndentRow">
                        <xsl:with-param name="columnName">LOCATIONCOUNTRY</xsl:with-param>
                        <xsl:with-param name="title">Location of Event - Country</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="IndentRow">
                        <xsl:with-param name="columnName">LOCATIONDISTRICT</xsl:with-param>
                        <xsl:with-param name="title">Location of Event - District</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="IndentRow">
                        <xsl:with-param name="columnName">LOCATIONPLACENAME</xsl:with-param>
                        <xsl:with-param name="title">Location of Event - Place Name</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="IndentRow">
                        <xsl:with-param name="columnName">LOCATIONQUALITY</xsl:with-param>
                        <xsl:with-param name="title">Location of Event - Quality</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="Indentx2Row">
                        <xsl:with-param name="columnName">TERRORISTEVENTTYPE</xsl:with-param>
                        <xsl:with-param name="title">Event Type</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="Indentx2Row">
                        <xsl:with-param name="columnName">INSIDEASSISTANCE</xsl:with-param>
                        <xsl:with-param name="title">Inside Assistance</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="Indentx2Row">
                        <xsl:with-param name="columnName">COUNTERTERRORISTTACTIC</xsl:with-param>
                        <xsl:with-param name="title">Counter Terrorist Tactic</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="Indentx2Row">
                        <xsl:with-param name="columnName">ATTACKSCALE</xsl:with-param>
                        <xsl:with-param name="title">Scale of Attack</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="Indentx2Row">
                        <xsl:with-param name="columnName">NUMBEROFATTACKS</xsl:with-param>
                        <xsl:with-param name="title">Number of Attacks</xsl:with-param>
                    </xsl:call-template>
                    <!--IN THE OLD REPORT THESE ROWS CAN REPEAT, IN THE NEW DATA THERE IS ONLY 1 TACTIC RECORDED. DO NOT SHOW SECTION IF NO TACTIC-->
                    <xsl:if test="string(TERRORISTTACTIC)">
                        <xsl:call-template name="Indentx3Row">
                            <xsl:with-param name="columnName">TERRORISTTACTIC</xsl:with-param>
                            <xsl:with-param name="title">Terrorist/Insurgent Attack Mode</xsl:with-param>
                        </xsl:call-template>
                        <xsl:call-template name="Indentx3Row">
                            <xsl:with-param name="columnName">EXPLOSIVEDEVICESIZE</xsl:with-param>
                            <xsl:with-param name="title">Explosive Device Size</xsl:with-param>
                        </xsl:call-template>
                        <xsl:call-template name="Indentx3Row">
                            <xsl:with-param name="columnName">SUICIDEATTACK</xsl:with-param>
                            <xsl:with-param name="title">Suicide Attack</xsl:with-param>
                        </xsl:call-template>
                    </xsl:if>
                    <!--END OF REPEAT-->
                    <!--THESE ROWS CAN REPEAT-->
                    <xsl:apply-templates select="XXX_TARGETSUMMARY" />
                    <!--END OF REPEAT-->
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">NONPERPETRATORSKILLED</xsl:with-param>
                        <xsl:with-param name="title">Non Terrorist/Insurgent Fatalities</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">PERPETRATORSKILLED</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Fatalities</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TOTALKILLED</xsl:with-param>
                        <xsl:with-param name="title">Total Fatalities</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">NONPERPETRATORSWOUNDED</xsl:with-param>
                        <xsl:with-param name="title">Non Terrorist/Insurgent Wounded</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">PERPETRATORSWOUNDED</xsl:with-param>
                        <xsl:with-param name="title">Terrorist/Insurgent Wounded</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">TOTALWOUNDED</xsl:with-param>
                        <xsl:with-param name="title">Total Wounded</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="title">Description of Injuries</xsl:with-param>
                        <xsl:with-param name="value">
                            <xsl:text></xsl:text>
                        </xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">KIDNAPPEDPERSONNEL</xsl:with-param>
                        <xsl:with-param name="title">Number of Hostages</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">DAMAGESCALE</xsl:with-param>
                        <xsl:with-param name="title">Damage Scale</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="title">Damage Description</xsl:with-param>
                        <xsl:with-param name="value">
                            <xsl:text></xsl:text>
                        </xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">EVENTNOTES</xsl:with-param>
                        <xsl:with-param name="title">Notes</xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="StandardRow">
                        <xsl:with-param name="columnName">SOURCE</xsl:with-param>
                        <xsl:with-param name="title">Source</xsl:with-param>
                    </xsl:call-template>
                </table>
                <p>
                    <xsl:text>&nbsp;</xsl:text>
                </p>
                <hr/>
                <xsl:text>&copy; 2017  Jane's Information Group</xsl:text>
                <br/>
                <font size="-1">
                    <xsl:text> (Note: Items from news/wire services are abstracted from the originals and are not verbatim)</xsl:text>
                </font>
                <br/>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="XXX_TARGETSUMMARY">
        <xsl:for-each select="ITEM">
            <xsl:call-template name="Indentx2Row">
                <xsl:with-param name="columnName">XXX_TARGETTYPEANDSUBTYPE</xsl:with-param>
                <xsl:with-param name="title">Type and Subtype of Target</xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="Indentx2Row">
                <xsl:with-param name="columnName">XXX_TARGETOWNCOUNTRY</xsl:with-param>
                <xsl:with-param name="title">Target Ownership Country</xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="Indentx2Row">
                <xsl:with-param name="columnName">XXX_TARGETOWNSECTOR</xsl:with-param>
                <xsl:with-param name="title">Target Ownership Sector</xsl:with-param>
            </xsl:call-template>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="StandardRow">
        <xsl:param name="columnName"/>
        <xsl:param name="title"/>
        <xsl:param name="value"/>

        <xsl:call-template name="GenerateRow">
            <xsl:with-param name="columnName">
                <xsl:value-of select="string($columnName)"/>
            </xsl:with-param>
            <xsl:with-param name="title">
                <xsl:value-of select="string($title)"/>
            </xsl:with-param>
            <xsl:with-param name="value">
                <xsl:value-of select="string($value)"/>
            </xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="IndentRow">
        <xsl:param name="columnName"/>
        <xsl:param name="title"/>
        <xsl:param name="value"/>
        <xsl:call-template name="GenerateRow">
            <xsl:with-param name="columnName">
                <xsl:value-of select="string($columnName)"/>
            </xsl:with-param>
            <xsl:with-param name="title">
                <xsl:value-of select="string($title)"/>
            </xsl:with-param>
            <xsl:with-param name="value">
                <xsl:value-of select="string($value)"/>
            </xsl:with-param>
            <xsl:with-param name="indent">15</xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="Indentx2Row">
        <xsl:param name="columnName"/>
        <xsl:param name="title"/>
        <xsl:param name="value"/>
        <xsl:call-template name="GenerateRow">
            <xsl:with-param name="columnName">
                <xsl:value-of select="string($columnName)"/>
            </xsl:with-param>
            <xsl:with-param name="title">
                <xsl:value-of select="string($title)"/>
            </xsl:with-param>
            <xsl:with-param name="value">
                <xsl:value-of select="string($value)"/>
            </xsl:with-param>
            <xsl:with-param name="indent">30</xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="Indentx3Row">
        <xsl:param name="columnName"/>
        <xsl:param name="title"/>
        <xsl:param name="value"/>
        <xsl:call-template name="GenerateRow">
            <xsl:with-param name="columnName">
                <xsl:value-of select="string($columnName)"/>
            </xsl:with-param>
            <xsl:with-param name="title">
                <xsl:value-of select="string($title)"/>
            </xsl:with-param>
            <xsl:with-param name="value">
                <xsl:value-of select="string($value)"/>
            </xsl:with-param>
            <xsl:with-param name="indent">45</xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="GenerateRow">
        <xsl:param name="columnName"/>
        <xsl:param name="title"/>
        <xsl:param name="value"/>
        <xsl:param name="indent"/>

        <xsl:variable name="columnValue">
            <xsl:choose>
                <xsl:when test="not(string($value))">
                    <xsl:value-of select="*[local-name()=$columnName]"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$value"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="columnTitle">
            <xsl:choose>
                <xsl:when test="string($title)">
                    <xsl:value-of select="$title"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$columnName"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <tr>
            <td>
                <xsl:if test="string($indent)">
                    <xsl:attribute name="style">
                        <xsl:text>padding-left:</xsl:text>
                        <xsl:value-of select="$indent"/>
                        <xsl:text>px!important;</xsl:text>
                    </xsl:attribute>
                </xsl:if>
                <b>
                    <xsl:value-of select="$columnTitle"/>
                </b>
            </td>
            <td>
                <xsl:value-of select="$columnValue"/>
                <xsl:text>&nbsp;</xsl:text>
            </td>
        </tr>
    </xsl:template>
</xsl:stylesheet>
