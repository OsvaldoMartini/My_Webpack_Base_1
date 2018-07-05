<?xml version='1.0'?>
<xsl:stylesheet
         version="3.0"
 	xmlns:doc="http://nwalsh.com/xsl/documentation/1.0"
 	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 	xmlns:xs="http://www.w3.org/2001/XMLSchema"
 	xmlns:j="http://dtd.janes.com/2002/Content/"
 	xmlns:janes="http://dtd.janes.com/2002/Content/"
 	xmlns:jm="http://dtd.janes.com/2005/metadata/"
 	xmlns:xlink='http://www.w3.org/1999/xlink'
 	xmlns:m="http://www.w3.org/1998/Math/MathML"
 	xmlns:dc="http://purl.org/dc/elements/1.1/"
 	xmlns:set="http://exslt.org/sets"
 	xmlns:dcterms="http://purl.org/dc/terms/"
 	xmlns:saxon="http://saxon.sf.net/"
 	xmlns:str="http://example.com/namespace"
 	xmlns:tmp="http://example.com/InternalContent/"
 	exclude-result-prefixes="#all"
 	
 >
  <xsl:param name="imagebase">/ExternalItems/Janes/images/</xsl:param>
  <xsl:param name="nonimagebase">/ExternalItems/Janes/images/</xsl:param>
  <xsl:param name="section"></xsl:param>

  <xsl:variable name="imagebs">
    <xsl:value-of select="$imagebase"/>
    <xsl:if test="substring($imagebase, string-length($imagebase)) != '/'">
      <xsl:text>/</xsl:text>
    </xsl:if>
  </xsl:variable>
  <xsl:variable name="nimagebs">
    <xsl:value-of select="$nonimagebase"/>
    <xsl:if test="substring($nonimagebase, string-length($nonimagebase)) != '/'">
      <xsl:text>/</xsl:text>
    </xsl:if>
  </xsl:variable>

  <xsl:output
    method="html"
    indent="yes"
    include-content-type="no"
    encoding="UTF-8"
    omit-xml-declaration="yes"
    saxon:character-representation="decimal"
/>

  <xsl:key name="shipInstances" match="//j:fleetList/j:shipInstance/*" use="local-name()" />


  <xsl:variable name="meta" select="janes:record/janes:metadata"/>
  <xsl:variable name="metaSubject" select="$meta/dc:subject"/>
  <xsl:variable name="pbt" select="$section"/>
  <xsl:variable name="pubabbrev" select="janes:record/@pubabbrev"/>


  <!-- Postdate -->
  <xsl:variable name="postdate" select='$meta/dc:date[@qualifier="postDate"]'/>
  <xsl:variable name="postyear" select="substring($postdate, 1, 4)"/>
  <xsl:variable name="postday" select="substring($postdate, 7, 2)"/>
  <xsl:variable name="postmonth">
    <xsl:variable name="monthNum" select="xs:integer(substring($postdate, 5, 2))"/>
    <xsl:call-template name = "monthabbrevfromnumber">
      <xsl:with-param name="monthNum" select="$monthNum"/>
    </xsl:call-template>
  </xsl:variable>

  <!-- pubDate -->
  <xsl:variable name="pubDate">
    <xsl:value-of select="$meta/dc:date[@qualifier='pubDate']"/>
  </xsl:variable>

  <xsl:variable name="typeflag">
    <xsl:choose>
      <xsl:when test='
          janes:record/@pubabbrev="FREP" or  
          janes:record/@pubabbrev="IDR" or  
          janes:record/@pubabbrev="IWR" or  
          janes:record/@pubabbrev="JAR" or  
          janes:record/@pubabbrev="JDIN" or  
          janes:record/@pubabbrev="JDW" or  
          janes:record/@pubabbrev="JIAA" or  
          janes:record/@pubabbrev="JID" or  
          janes:record/@pubabbrev="JIR" or 
          janes:record/@pubabbrev="JIWK" or 
          janes:record/@pubabbrev="JMR" or  
          janes:record/@pubabbrev="JNI" or  
          janes:record/@pubabbrev="JPRJ" or  
          janes:record/@pubabbrev="JPRD" or  
          janes:record/@pubabbrev="JPR" or  
          janes:record/@pubabbrev="JPRC" or  
          janes:record/@pubabbrev="JTF" or  
          janes:record/@pubabbrev="JTSM" or  
          janes:record/@pubabbrev="RJHM" or  
          janes:record/@pubabbrev="TWR" or  
          janes:record/@pubabbrev="IWR" or
          janes:record/@pubabbrev="SMITJ" or      
          (janes:record/@pubabbrev="JCBRN" and contains(janes:record/@id, "jcbrn")) or
          
          normalize-space(/janes:record/janes:metadata/dc:subject[@qualifier="publication"]) = "Jane&apos;s Terrorism and Insurgency Centre"
          '>
        <xsl:value-of select="'News'"/>
      </xsl:when>
      <xsl:when test='  
          janes:record/@pubabbrev="USC" or
          janes:record/@pubabbrev="FEA" or
          janes:record/@pubabbrev="MEA" or
          janes:record/@pubabbrev="EUR" or
          janes:record/@pubabbrev="CLA"
        '>
        <xsl:value-of select="'JAHA'"/>
      </xsl:when>
      <xsl:when test='janes:record/@pubabbrev="JDEI"'>
        <xsl:value-of select="'Images'"/>
      </xsl:when>      
      <xsl:otherwise>
        <xsl:value-of select="'Reference'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>


  <!-- newline -->
  <xsl:variable name="n">
    <xsl:text>
</xsl:text>
  </xsl:variable>

  <!-- indent -->
  <xsl:variable name="t">
    <xsl:text>  </xsl:text>
  </xsl:variable>

  <!-- max top thumbnails -->
  <xsl:variable name="topThumbCount" select="0"/>

  <!-- Location of files variables -->

  <xsl:variable name="recpubabbrev" select="/*:record/@pubabbrev"/>

  <xsl:variable name="publication">
    <xsl:value-of select="$meta/dc:subject[@qualifier = 'publication']"/>
  </xsl:variable>



  <xsl:variable name="imagetypes">

    <root>

      <item name="graphic">g</item>
      <item name="lineDrawing">l</item>
      <item name="map">m</item>
      <item name="picture">p</item>
      <item name="satellite">x</item>

    </root>


  </xsl:variable>


  <!-- translations for attribute content, to prevent serializer bug causing invalid html, ticket 187849 -->
  <xsl:variable name="translations">
    <root>
      <item number="9">
        <xsl:text>&#160;</xsl:text>
      </item>
      <item number="32">
        <xsl:text>&#160;</xsl:text>
      </item>
      <item number="33">'</item>
      <item number="38"> AND </item>
      <item number="39">'</item>
      <item number="96">'</item>
      <item number="161">!</item>
      <item number="162">c</item>
      <item number="163">Pds</item>
      <item number="165">{YN}</item>
      <item number="166">|</item>
      <item number="169">(c)</item>
      <item number="173">-</item>
      <item number="174">{RT}</item>
      <item number="175">-</item>
      <item number="177">+-</item>
      <item number="178">{2}</item>
      <item number="179">{3}</item>
      <item number="180">'</item>
      <item number="183">.</item>
      <item number="185">{1}</item>
      <item number="188">{1/4}</item>
      <item number="189">{1/2}</item>
      <item number="190">{3/4}</item>
      <item number="191">?</item>
      <item number="192">A</item>
      <item number="193">A</item>
      <item number="194">A</item>
      <item number="195">A</item>
      <item number="196">A</item>
      <item number="197">A</item>
      <item number="198">AE</item>
      <item number="199">C</item>
      <item number="200">E</item>
      <item number="201">E</item>
      <item number="202">E</item>
      <item number="203">E</item>
      <item number="204">I</item>
      <item number="205">I</item>
      <item number="206">I</item>
      <item number="207">I</item>
      <item number="208">D</item>
      <item number="209">N</item>
      <item number="210">O</item>
      <item number="211">O</item>
      <item number="212">O</item>
      <item number="213">O</item>
      <item number="214">O</item>
      <item number="215">x</item>
      <item number="216">O</item>
      <item number="217">U</item>
      <item number="218">U</item>
      <item number="219">U</item>
      <item number="220">U</item>
      <item number="221">Y</item>
      <item number="222">B</item>
      <item number="223">ss</item>
      <item number="224">a</item>
      <item number="225">a</item>
      <item number="226">a</item>
      <item number="227">a</item>
      <item number="228">a</item>
      <item number="229">a</item>
      <item number="230">ae</item>
      <item number="231">c</item>
      <item number="232">e</item>
      <item number="233">e</item>
      <item number="234">e</item>
      <item number="235">e</item>
      <item number="236">i</item>
      <item number="237">i</item>
      <item number="238">i</item>
      <item number="239">i</item>
      <item number="240">o</item>
      <item number="241">n</item>
      <item number="242">o</item>
      <item number="243">o</item>
      <item number="244">o</item>
      <item number="245">o</item>
      <item number="246">o</item>
      <item number="247">/</item>
      <item number="248">o</item>
      <item number="249">u</item>
      <item number="250">u</item>
      <item number="251">u</item>
      <item number="252">u</item>
      <item number="253">y</item>
      <item number="254">b</item>
      <item number="255">y</item>
      <item number="256">A</item>
      <item number="257">a</item>
      <item number="258">A</item>
      <item number="259">a</item>
      <item number="260">A</item>
      <item number="261">a</item>
      <item number="262">C</item>
      <item number="263">c</item>
      <item number="264">C</item>
      <item number="265">c</item>
      <item number="266">C</item>
      <item number="267">c</item>
      <item number="268">C</item>
      <item number="269">c</item>
      <item number="270">D</item>
      <item number="271">d</item>
      <item number="272">D</item>
      <item number="273">d</item>
      <item number="274">E</item>
      <item number="275">e</item>
      <item number="276">E</item>
      <item number="277">e</item>
      <item number="278">E</item>
      <item number="279">e</item>
      <item number="280">E</item>
      <item number="281">e</item>
      <item number="282">E</item>
      <item number="283">e</item>
      <item number="284">G</item>
      <item number="285">g</item>
      <item number="286">G</item>
      <item number="287">g</item>
      <item number="288">G</item>
      <item number="289">g</item>
      <item number="290">G</item>
      <item number="291">g</item>
      <item number="292">H</item>
      <item number="293">h</item>
      <item number="294">H</item>
      <item number="295">h</item>
      <item number="296">I</item>
      <item number="297">i</item>
      <item number="298">I</item>
      <item number="299">i</item>
      <item number="300">I</item>
      <item number="301">i</item>
      <item number="302">I</item>
      <item number="303">i</item>
      <item number="304">I</item>
      <item number="305">i</item>
      <item number="306">IJ</item>
      <item number="307">ij</item>
      <item number="308">J</item>
      <item number="309">j</item>
      <item number="310">K</item>
      <item number="311">k</item>
      <item number="312">k</item>
      <item number="313">L</item>
      <item number="314">l</item>
      <item number="315">L</item>
      <item number="316">l</item>
      <item number="317">L</item>
      <item number="318">l</item>
      <item number="319">L</item>
      <item number="320">l</item>
      <item number="321">L</item>
      <item number="322">l</item>
      <item number="323">N</item>
      <item number="324">n</item>
      <item number="325">N</item>
      <item number="326">n</item>
      <item number="327">N</item>
      <item number="328">n</item>
      <item number="329">n</item>
      <item number="330">N</item>
      <item number="331">n</item>
      <item number="332">O</item>
      <item number="333">o</item>
      <item number="334">O</item>
      <item number="335">o</item>
      <item number="336">O</item>
      <item number="337">o</item>
      <item number="338">OE</item>
      <item number="339">oe</item>
      <item number="340">R</item>
      <item number="341">r</item>
      <item number="342">R</item>
      <item number="343">r</item>
      <item number="344">R</item>
      <item number="345">r</item>
      <item number="346">S</item>
      <item number="347">s</item>
      <item number="348">S</item>
      <item number="349">s</item>
      <item number="350">S</item>
      <item number="351">s</item>
      <item number="352">S</item>
      <item number="353">s</item>
      <item number="354">T</item>
      <item number="355">t</item>
      <item number="356">T</item>
      <item number="357">t</item>
      <item number="358">T</item>
      <item number="359">t</item>
      <item number="360">U</item>
      <item number="361">u</item>
      <item number="362">U</item>
      <item number="363">u</item>
      <item number="364">U</item>
      <item number="365">u</item>
      <item number="366">U</item>
      <item number="367">u</item>
      <item number="368">U</item>
      <item number="369">u</item>
      <item number="370">U</item>
      <item number="371">u</item>
      <item number="372">W</item>
      <item number="373">w</item>
      <item number="374">Y</item>
      <item number="375">y</item>
      <item number="376">Y</item>
      <item number="377">Z</item>
      <item number="378">z</item>
      <item number="379">Z</item>
      <item number="380">z</item>
      <item number="381">Z</item>
      <item number="382">z</item>
      <item number="383">I</item>
      <item number="402">{f}</item>
      <item number="462">a</item>
      <item number="466">o</item>
      <item number="486">G</item>
      <item number="487">g</item>
      <item number="506">A</item>
      <item number="507">a</item>
      <item number="508">AE</item>
      <item number="509">ae</item>
      <item number="510">O</item>
      <item number="511">o</item>
      <item number="700">'</item>
      <item number="710">^</item>
      <item number="732">~</item>
      <item number="902">A</item>
      <item number="904">E</item>
      <item number="905">H</item>
      <item number="906">I</item>
      <item number="908">O</item>
      <item number="910">Y</item>
      <item number="912">I</item>
      <item number="970">i</item>
      <item number="972">o</item>
      <item number="1040">A</item>
      <item number="1041">B</item>
      <item number="1042">V</item>
      <item number="1043">G</item>
      <item number="1044">D</item>
      <item number="1045">E</item>
      <item number="1047">Z</item>
      <item number="1050">K</item>
      <item number="1051">L</item>
      <item number="1052">M</item>
      <item number="1054">O</item>
      <item number="1055">P</item>
      <item number="1056">R</item>
      <item number="1057">S</item>
      <item number="1059">U</item>
      <item number="1060">F</item>
      <item number="1061">Kh</item>
      <item number="1067">Y</item>
      <item number="1071">Ya</item>
      <item number="7743">m</item>
      <item number="7808">W</item>
      <item number="7809">w</item>
      <item number="7810">W</item>
      <item number="7811">w</item>
      <item number="7812">W</item>
      <item number="7813">w</item>
      <item number="7822">Y</item>
      <item number="7823">y</item>
      <item number="8194">
        <xsl:text>&#160;</xsl:text>
      </item>
      <item number="8195">
        <xsl:text>&#160;</xsl:text>
      </item>
      <item number="8201">
        <xsl:text>&#160;</xsl:text>
      </item>
      <item number="8208">-</item>
      <item number="8211">-</item>
      <item number="8212">-</item>
      <item number="8213">-</item>
      <item number="8216">'</item>
      <item number="8217">'</item>
      <item number="8218">,</item>
      <item number="8219">'</item>
      <item number="8220">'</item>
      <item number="8221">'</item>
      <item number="8222">'</item>
      <item number="8223">'</item>
      <item number="8224">!</item>
      <item number="8225">!!</item>
      <item number="8226">-</item>
      <item number="8230">...</item>
      <item number="8240">{o/oo}</item>
      <item number="8242">'</item>
      <item number="8243">'</item>
      <item number="8249">&lt;</item>
      <item number="8250">&gt;</item>
      <item number="8254">-</item>
      <item number="8260">/</item>
      <item number="8364">Euro</item>
      <item number="8482">{TM}</item>
      <item number="8531">{1/3}</item>
      <item number="8532">{2/3}</item>
      <item number="8534">{2/5}</item>
      <item number="8537">{1/6}</item>
      <item number="8538">{5/6}</item>
      <item number="8539">{1/8}</item>
      <item number="8540">{3/8}</item>
      <item number="8541">{5/8}</item>
      <item number="8542">{7/8}</item>
      <item number="8722">-</item>
      <item number="8727">*</item>
      <item number="8730">{sr}</item>
      <item number="8734">{~}</item>
      <item number="8764">~</item>
      <item number="8773">=~</item>
      <item number="8776">=~</item>
      <item number="8778">=~</item>
      <item number="8800">|=</item>
      <item number="8801">==</item>
      <item number="8804">&lt;=</item>
      <item number="8805">&gt;=</item>
      <item number="8901">.</item>
      <item number="9001">&lt;</item>
      <item number="9002">&gt;</item>
    </root>
  </xsl:variable>



  <!-- overrides -->
  <xsl:template match="text()">
    <xsl:value-of select="replace(replace(., '(\n|\r)', ' '), '\s+', ' ')"/>
  </xsl:template>


  <xsl:template match='/'>

    <html>
      <body>
          <xsl:call-template name="H2"/>
        
          <xsl:choose>
            <xsl:when test='j:record[@pubabbrev="JAWA"]'>
              <xsl:choose>
                <xsl:when test='
			string(j:record/j:metadata/dc:subject[@qualifier="role"][1]) = "manufacturer"
			and
			not (string(j:record/j:title[1]))
			'>


                  <h3 align="center">
                    <b>
                      <xsl:text>MANUFACTURER DETAILS</xsl:text>
                    </b>
                  </h3>

                </xsl:when>
              </xsl:choose>
            </xsl:when>
          </xsl:choose>


        <!--<p align="left">
          <strong>
            <xsl:call-template name="section.header"/>
          </strong>
        </p>-->

        

        <xsl:if test="//dc:subject[@qualifier='updateStatus'] and //dc:subject[@qualifier='updateStatus'] != ''">

          <table width="100%">
            <tr>
              <td align="right">
                <i>
                  <b>
                    <xsl:choose>
                      <xsl:when test='//dc:subject[@qualifier="updateStatus"]="new"'>
                        <xsl:text>NEW ENTRY</xsl:text>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:value-of select="translate(//dc:subject[@qualifier='updateStatus'],'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                      </xsl:otherwise>
                    </xsl:choose>
                  </b>
                </i>
              </td>
            </tr>
          </table>

        </xsl:if>

        <xsl:if test="j:record/j:metadata/jm:organisation[1]/jm:igruOrgId[1]">

          <p align="right">
            <font size="-1">
              <xsl:value-of select="j:record/j:metadata/jm:organisation[1]/jm:igruOrgId[1]" />
            </font>
          </p>

        </xsl:if>

          <xsl:if test="count(//janes:title[not(ancestor::janes:noteGroup)]) &gt; 4 and $typeflag='Reference'">

            <p align="center">
              <b>Contents</b>
            </p>
            <table width="100%">
              <xsl:for-each select='j:record/*//j:title[1]'>
                <xsl:if test='parent::j:sect1 or parent::j:sect2 or parent::j:sect3'>
                  <tr>
                    <td width='5%'></td>
                    <td>
                      <table width="100%">
                        <tr>
                          <td>
                            <xsl:if test='parent::j:sect1'>
                              <xsl:attribute name="width">
                                <xsl:text>1%</xsl:text>
                              </xsl:attribute>
                            </xsl:if>
                            <xsl:if test='parent::j:sect2'>
                              <xsl:attribute name="width">
                                <xsl:text>5%</xsl:text>
                              </xsl:attribute>
                            </xsl:if>
                            <xsl:if test='parent::j:sect3'>
                              <xsl:attribute name="width">
                                <xsl:text>10%</xsl:text>
                              </xsl:attribute>
                            </xsl:if>
                          </td>
                          <td>
                            <xsl:value-of select="."/>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </xsl:if>
              </xsl:for-each>
            </table>
          </xsl:if>
        
        <xsl:call-template name="subsOf" />

        <xsl:choose>
          <xsl:when test="$pubabbrev = 'JCBRN' and contains(janes:record/@id, 'jcbrn')">
            <xsl:apply-templates select="janes:record/*[ not(name() = 'janes:metadata' or name() = 'janes:title' or name() = 'janes:authoredBy' or name() = 'janes:relatedInfo' or name() = 'janes:mediaBlock')  and not (@qualifier = 'keyPoints' or @qualifier = 'event' or @qualifier = 'disclaimer' or @qualifier = 'breakout' or @qualifier = 'box')]"/>
            <xsl:apply-templates select="janes:record/janes:sect1[@qualifier = 'box']"/>
            <xsl:apply-templates select="janes:record/janes:sect1[@qualifier = 'breakout']"/>
            <xsl:apply-templates select="janes:record/janes:mediaBlock"/>
            <xsl:apply-templates select="janes:record/janes:relatedInfo"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="janes:record/*[ not(name() = 'janes:metadata' or name() = 'janes:title' or name() = 'janes:authoredBy' or name() = 'janes:relatedInfo')  and not (@qualifier = 'keyPoints' or @qualifier = 'event' or @qualifier = 'disclaimer')]"/>
            <xsl:apply-templates select="janes:record/janes:relatedInfo"/>
          </xsl:otherwise>
        </xsl:choose>


        <xsl:if test="//j:metadata/jm:organisation/jm:classification[@qualifier='primary']/jm:standardName">
          <xsl:call-template name="Pri_Sec_business_type" />
        </xsl:if>


        <xsl:if test="$meta/jm:equipment[@mode = 'baseModel']/jm:standardName!=''">
          <!-- put tests for all additional info here -->
          <table border="1" width="100%">
            <tr>
              <td bgcolor="#EBEBEB">Additional Information</td>
            </tr>
            <tr>
              <td>
                <xsl:text>Equipment Details [Equipment - Classification - Manufacturer]:</xsl:text>
                <br/>
                <xsl:apply-templates select="$meta/jm:equipment[@mode = 'baseModel']"/>
              </td>
            </tr>
          </table>
        </xsl:if>
       
        <xsl:if test="$pubabbrev = 'IWR' or $pubabbrev = 'TWR' or $pubabbrev = 'JTIC'">
          <p>    
            <xsl:choose>
              <xsl:when test="//janes:sect1[@qualifier = 'disclaimer']">
                <xsl:apply-templates select="//janes:sect1[@qualifier = 'disclaimer']"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:text>(Note: Items from news/wire services are abstracted from the originals and are not verbatim)</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </p>
        </xsl:if>
      </body>
    </html>

  </xsl:template>


  <xsl:template match="jm:equipment[@mode = 'baseModel']">

    <xsl:call-template name="builddictline">
      <xsl:with-param name="number">
        <xsl:value-of select="count(ancestor::jm:equipment[@mode = 'baseModel']) + 1"/>
      </xsl:with-param>
      <xsl:with-param name="label">
        <xsl:text>Base Model</xsl:text>
      </xsl:with-param>
    </xsl:call-template>
    <br/>
    <xsl:apply-templates select="jm:equipment"/>

  </xsl:template>

  <xsl:template match="jm:equipment//jm:id"/>

  <xsl:template match="jm:equipment[@mode = 'variant']">
    <xsl:param name="number"/>

    <xsl:call-template name="builddictline">
      <xsl:with-param name="number">
        <xsl:value-of select="count(ancestor::jm:equipment[@mode = 'baseModel']) + 1"/>
      </xsl:with-param>
      <xsl:with-param name="label">
        <xsl:value-of select="concat('Variant of ', parent::jm:equipment/jm:standardName)"/>
      </xsl:with-param>
    </xsl:call-template>
    <br/>
    <xsl:apply-templates select="jm:equipment"/>

  </xsl:template>

  <xsl:template name="builddictline">

    <xsl:param name="number"/>
    <xsl:param name="label">Base Model</xsl:param>

    <xsl:if test="$number &lt; 7 and $number &gt; 0">
      <xsl:for-each select="1 to $number">
        <xsl:text>&#160;&#160;&#160;</xsl:text>
      </xsl:for-each>
    </xsl:if>
    <xsl:value-of select="jm:standardName"/>
    <xsl:text> - </xsl:text>
    <xsl:value-of select="jm:classification[@qualifier='primary'][@taxonomy='Class Hierarchy'][1]/jm:standardName"/>
    <xsl:text> - </xsl:text>

    <xsl:for-each select="jm:organisation[jm:context/jm:standardName='manufacturer']">
      <xsl:value-of select="jm:alias"/>
      <xsl:if test="not(position() = last())">
        <xsl:text>|</xsl:text>
      </xsl:if>
    </xsl:for-each>

    <xsl:if test="jm:alias[not(@processed='prependContractor')]">
      <xsl:text> (</xsl:text>
      <xsl:for-each select="jm:alias[not(@processed='prependContractor')]">
        <xsl:value-of select="."/>
        <xsl:if test="@designation and not(@designation = '')">
          <i>
            <xsl:text>&#160;</xsl:text>
            <xsl:value-of select="@designation"/>
          </i>
        </xsl:if>
      </xsl:for-each>
      <xsl:text>)</xsl:text>
    </xsl:if>

  </xsl:template>










  <!--

*********************************

MAIN TEMPLATES

*********************************

-->

  <!-- ********************** -->
  <!-- NEW SPECIFICATIONS -->
  <!-- ********************** -->

  <xsl:template match="j:fieldedData">
    <!-- Need to remove certain rows and apply other rules. Easiest method is to create an internal XML variable with the results grouped together which we can query -->

    <xsl:variable name="mergedequipall">
      <tmp:equip>
        <xsl:attribute name="cols" select="count(j:fd_equipment) + 1"/>
        <xsl:attribute name="instances" select="count(//*:shipInstance)"/>
        <xsl:for-each select="j:fd_equipment">
          <xsl:element name="tmp:column">
            <xsl:attribute name="name">
              <xsl:for-each select="j:name">
                <xsl:if test="position() &gt; 1">
                  <xsl:text>, </xsl:text>
                </xsl:if>
                <xsl:value-of select="."/>
              </xsl:for-each>
            </xsl:attribute>
            <xsl:attribute name="num" select="count(preceding-sibling::j:fd_equipment) + 1"/>
          </xsl:element>
        </xsl:for-each>

        <xsl:variable name="tmpmerge">
          <root>
            <xsl:apply-templates select="j:fd_equipment//j:fd/j:fdGroup" mode="merge"/>
          </root>
        </xsl:variable>
        <!--
	   		<xsl:message><xsl:copy-of select="$tmpmerge"/></xsl:message>
	   		-->

        <xsl:call-template name="groupit">
          <xsl:with-param name="xmltogroup">
            <root>
              <xsl:apply-templates select="j:fd_equipment//j:fd/j:fdGroup" mode="merge"/>
            </root>
          </xsl:with-param>
        </xsl:call-template>
      </tmp:equip>
    </xsl:variable>

    <xsl:variable name="mergedequip">

      <xsl:choose>
        <xsl:when test="$displayUnknowns = 1">
          <xsl:copy-of select="$mergedequipall"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="$mergedequipall" mode="clip"/>
        </xsl:otherwise>
      </xsl:choose>

    </xsl:variable>

    <!--
<xsl:message><xsl:copy-of select="$mergedequip"/></xsl:message>
-->
    <!--
<xsl:message><xsl:copy-of select="$mergedequipall"/></xsl:message>
-->

    <!--
	<xsl:element name="p">
		<xsl:value-of select="j:fd_equipment[1]/j:name"/>
	</xsl:element>
-->

    <table border="1">
        <xsl:apply-templates select="$mergedequip/tmp:equip"/>
    </table>

  </xsl:template>

  <!-- CLIP -->

  <!-- Clipping unknowns -->

  <xsl:template match="*" mode="clip">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates mode="clip"/>
    </xsl:copy>
  </xsl:template>

  <!-- remove rows which contain all unknowns -->
  <xsl:template match="tmp:group" mode="clip">
    <!--<xsl:message> Clipping <xsl:value-of select="@label"/></xsl:message>-->
    <xsl:choose>

      <!-- There must exist a value that
			1) Is not a connector
			2) Is not unknown/not applicable
			3) Not second half of ratio where first is unknown (unknown:1 doesn't count)
			4) Not first half of ratio where second is unknown (1:unknown doesn't count)
		-->
      <xsl:when test=".//tmp:value[not(contains(@qualifier,'connector'))][not(@status = ('unknown', 'notApplicable'))][not(preceding-sibling::tmp:value[1]/@qualifier = 'connector_ratio' and preceding-sibling::tmp:value[2]/@status = ('unknown', 'notApplicable'))][not(following-sibling::tmp:value[1]/@qualifier = 'connector_ratio' and following-sibling::tmp:value[2]/@status = ('unknown', 'notApplicable'))]">
        <!--<xsl:message>Found <xsl:copy-of select=".//tmp:value[not(contains(@qualifier,'connector'))][not(@status = ('unknown', 'notApplicable'))]"/></xsl:message>-->
        <xsl:copy>
          <xsl:copy-of select="@*"/>
          <xsl:apply-templates mode="clip"/>
        </xsl:copy>
      </xsl:when>

      <xsl:when test=".//tmp:narrative">
        <!--<xsl:message>Found narrative!</xsl:message>-->
        <xsl:copy>
          <xsl:copy-of select="@*"/>
          <xsl:apply-templates mode="clip"/>
        </xsl:copy>
      </xsl:when>

      <xsl:otherwise>

        <!--<xsl:message>No active children</xsl:message>-->

      </xsl:otherwise>

    </xsl:choose>

  </xsl:template>


  <!-- Make HTML tables -->

  <xsl:template match="tmp:equip">

    <tr>
      <th bgcolor="#EBEBEB"></th>
      <xsl:for-each select="tmp:column">
        <th bgcolor="#EBEBEB">
          <b>
            <xsl:value-of select="@name"/>
          </b>
        </th>
      </xsl:for-each>
    </tr>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tmp:group[@label = 'Grouped conditions'][@level = '0']" priority="2">
      <xsl:element name="tr">
        <xsl:element name="td">
        <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
        <xsl:text>&#160;&#160;&#160;</xsl:text>
      </xsl:element>
      <xsl:apply-templates select="tmp:group[@label = '']/tmp:valuegroup"/>
      </xsl:element>
  </xsl:template>


  <xsl:template match="tmp:group[tmp:group/tmp:valuegroup/tmp:fdValue/tmp:narrative]">

    <!--<xsl:message>Narrative group!!!</xsl:message>-->

    <xsl:element name="tr">

      <xsl:element name="td">
        <xsl:if test="@level = '1'">
          <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
        </xsl:if>

        <xsl:variable name="indentlevel">
          <xsl:choose>
            <!-- If indent is a positive number -->
            <xsl:when test="matches(@level, '^[1-9][0-9]*$')">
              <xsl:value-of select="xs:integer(@level) - 1"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="0"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:if test="$indentlevel &gt; 1">
          <!--<xsl:for-each select="1 to $indentlevel">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
          </xsl:for-each>-->
          <xsl:attribute name="style">
            <xsl:text>margin-left: </xsl:text>
            <xsl:value-of select="($indentlevel - 1) * 10"/>
            <xsl:text>px</xsl:text>
          </xsl:attribute>          
        </xsl:if>

        <xsl:choose>
          <xsl:when test="$indentlevel &lt; 2">
            <xsl:element name="b">
              <!--<xsl:if test="$indentlevel = 1">
                <xsl:text>&#160;&#160;&#160;</xsl:text>
              </xsl:if>-->
              <xsl:apply-templates select="@label"/>
              <!-- Add colons to labels -->
              <xsl:choose>
                <!-- Just in case label already ends in colon-->
                <xsl:when test="matches(@label, ': *$')"/>
                <!-- not lowest level, but every other level -->
                <xsl:otherwise>
                  <xsl:text>:</xsl:text>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="@label"/>
            <!-- Add colons to labels -->
            <xsl:choose>
              <!-- Just in case label already ends in colon-->
              <xsl:when test="matches(@label, ': *$')"/>
              <!-- not lowest level, but every other level -->
              <xsl:otherwise>
                <xsl:text>:</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>

      </xsl:element>
      <xsl:variable name="bgcol">
        <xsl:if test="@level = 1">blue</xsl:if>
      </xsl:variable>
      <xsl:apply-templates select="tmp:group[tmp:valuegroup/tmp:fdValue/tmp:narrative]/tmp:valuegroup">
        <xsl:with-param name="backgroundcolour">
          <xsl:value-of select="$bgcol"/>
        </xsl:with-param>
      </xsl:apply-templates>
    </xsl:element>


    <xsl:apply-templates select="tmp:group[tmp:group/tmp:valuegroup/tmp:fdValue/tmp:narrative[@generated='y']]"/>

  </xsl:template>


  <xsl:template match="tmp:group">


    <xsl:element name="tr">

      <xsl:element name="td">
        <xsl:if test="@level = '1'">
          <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
        </xsl:if>

        <xsl:variable name="indentlevel">
          <xsl:choose>
            <!-- If indent is a positive number -->
            <xsl:when test="matches(@level, '^[1-9][0-9]*$')">
              <xsl:value-of select="xs:integer(@level) - 1"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="0"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:if test="$indentlevel &gt; 1">
          <!--<xsl:for-each select="1 to $indentlevel">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
          </xsl:for-each>-->
          <xsl:attribute name="style">
            <xsl:text>margin-left: </xsl:text>
            <xsl:value-of select="($indentlevel - 1) * 10"/>
            <xsl:text>px</xsl:text>
          </xsl:attribute>        
        </xsl:if>

        <xsl:choose>
          <xsl:when test="$indentlevel &lt; 2">
            <xsl:element name="b">
              <!--<xsl:if test="$indentlevel = 1">
                <xsl:text>&#160;&#160;&#160;</xsl:text>
              </xsl:if>-->
              <xsl:apply-templates select="@label"/>
              <!-- Add colons to labels -->
              <xsl:choose>
                <!-- Just in case label already ends in colon-->
                <xsl:when test="matches(@label, ': *$')"/>
                <!-- not lowest level, but every other level -->
                <xsl:when test="tmp:group"></xsl:when>
                <xsl:otherwise>
                  <xsl:text>:</xsl:text>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="@label"/>
            <!-- Add colons to labels -->
            <xsl:choose>
              <!-- Just in case label already ends in colon-->
              <xsl:when test="matches(@label, ': *$')"/>
              <!-- not lowest level, but every other level -->
              <xsl:when test="tmp:group"></xsl:when>
              <xsl:otherwise>
                <xsl:text>:</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>

      </xsl:element>
      <xsl:choose>
        <xsl:when test="tmp:valuegroup">
          <xsl:apply-templates select="tmp:valuegroup"/>
        </xsl:when>
        <xsl:when test="tmp:group[@label = 'Grouped conditions']">
          <xsl:apply-templates select="tmp:group[@label = 'Grouped conditions']/tmp:group[@label = '']/tmp:valuegroup"/>
        </xsl:when>
        <!-- add in empty cells for labels without values - makes table look better -->
        <xsl:otherwise>
          <xsl:variable name="dobackgroundcolor">
            <xsl:if test="@level = '1'">Yes</xsl:if>
          </xsl:variable>
          <xsl:for-each select="2 to xs:integer(ancestor::tmp:equip/@cols)">
            <xsl:element name="td">
              <xsl:if test="$dobackgroundcolor = 'Yes'">
                <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
              </xsl:if>
              <xsl:text>&#160;</xsl:text>
            </xsl:element>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>

    </xsl:element>


    <xsl:apply-templates select="tmp:group[not(@label = 'Grouped conditions')]"/>

  </xsl:template>

  <xsl:template match="tmp:valuegroup[parent::tmp:group[@label = 'narrative']]">

    <xsl:param name="backgroundcolour"/>

    <xsl:variable name="maxcols" select="xs:integer(ancestor::tmp:equip/@cols) - 1" as="xs:integer"/>

    <xsl:variable name="context">

      <xsl:copy>
        <xsl:for-each select="@*">
          <xsl:copy-of select="."/>
          `
        </xsl:for-each>

        <xsl:call-template name="collatefdgroupsforcol">
          <xsl:with-param name="col" select="1"/>
          <xsl:with-param name="maxcol" select="$maxcols"/>
        </xsl:call-template>

      </xsl:copy>

    </xsl:variable>

    <xsl:call-template name="grouprowsbycolumn">

      <xsl:with-param name="context" select="$context"/>
      <xsl:with-param name="backgroundcolour" select="$backgroundcolour"/>

    </xsl:call-template>

  </xsl:template>

  <xsl:template name="collatefdgroupsforcol">

    <xsl:param name="col" select="1"/>
    <xsl:param name="maxcol" select="0"/>

    <!--<xsl:message>Column = <xsl:value-of select="$col"/></xsl:message>-->

    <xsl:if test="$col &lt;= $maxcol">

      <xsl:choose>

        <xsl:when test="tmp:fdValue[xs:integer(@column) = $col]">

          <!--<xsl:message>fdValue exists</xsl:message>-->

          <xsl:copy-of select="tmp:fdValue[@column = $col]"/>

        </xsl:when>

        <xsl:when test="../../tmp:valuegroup/tmp:fdValue[@column = $col]">

          <!--<xsl:message>Getting fdValue content from parent (no narrative in narrative group)</xsl:message>-->

          <xsl:copy-of select="../../tmp:valuegroup/tmp:fdValue[@column = $col]"/>

        </xsl:when>

        <xsl:otherwise>

          <!--<xsl:message>No suitable value for this column!</xsl:message>-->

        </xsl:otherwise>

      </xsl:choose>

      <xsl:call-template name="collatefdgroupsforcol">
        <xsl:with-param name="col" select="$col + 1"/>
        <xsl:with-param name="maxcol" select="$maxcol"/>
      </xsl:call-template>

    </xsl:if>

  </xsl:template>

  <xsl:template match="tmp:valuegroup">

    <xsl:param name="backgroundcolour"/>

    <xsl:call-template name="grouprowsbycolumn">

      <xsl:with-param name="context">

        <xsl:copy-of select="."/>

      </xsl:with-param>

      <xsl:with-param name="backgroundcolour" select="$backgroundcolour"/>
      
    </xsl:call-template>

  </xsl:template>

  <xsl:template name="grouprowsbycolumn">

    <xsl:param name="context"/>
    <xsl:param name="backgroundcolour"/>

    <xsl:for-each-group select="$context/tmp:valuegroup/tmp:fdValue" group-by="@column">

      <!--<xsl:message>Looking at column <xsl:value-of select="current-grouping-key()"/></xsl:message>-->

      <xsl:element name="td">

        <xsl:if test="ancestor::tmp:group[1]/@level = '1' or ancestor::tmp:group[2]/@label = 'Grouped conditions' or $backgroundcolour = 'blue'">
          <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
        </xsl:if>

        <xsl:for-each select="current-group()">

          <xsl:if test="position() &gt; 1">
            <xsl:element name="br"/>
          </xsl:if>

          <xsl:choose>

            <!-- When there is a narrative, use that -->
            <xsl:when test="tmp:narrative">
              <xsl:apply-templates/>
            </xsl:when>

            <!-- Turn unknown ratios into unknown (only do of form unknown:1, 1:unknown)-->
            <xsl:when test=".//tmp:value[@qualifier = 'connector_ratio'][count(preceding-sibling::tmp:value) = 1][count(following-sibling::tmp:value) = 1][../tmp:value/@status = 'unknown']">
              <xsl:text>-</xsl:text>
            </xsl:when>
            <xsl:when test=".//tmp:value[@qualifier = 'connector_ratio'][count(preceding-sibling::tmp:value) = 1][count(following-sibling::tmp:value) = 1][../tmp:value/@status = 'notApplicable']">
              <xsl:text>n/a</xsl:text>
            </xsl:when>

            <!-- ACTUAL DATA VALUE PROCESSING -->
            <!-- Process only fdValue where there is a value that isn't unknown or not applicable-->
            <xsl:when test=".//tmp:value[not(contains(@qualifier,'connector'))][not(@status = ('unknown', 'notApplicable'))]">
              <xsl:apply-templates/>
              <xsl:if test="not(tmp:appli) and ancestor::*/tmp:appli">
                <xsl:apply-templates select="(ancestor::*/tmp:appli)[1]"/>
              </xsl:if>
            </xsl:when>

            <!-- Don't put in unknowns for applis -->
            <xsl:when test="tmp:value[not(contains(@qualifier,'connector'))][@status = 'unknown' or @status = 'notApplicable'] and (tmp:appli or ancestor::tmp:*/tmp:appli)">
            </xsl:when>

            <!-- All unknowns or not applicable -->
            <!-- if any of the fdValues without values contains unknown, put "unknown"-->
            <xsl:when test=".//tmp:value[not(contains(@qualifier,'connector'))][@status = 'unknown']">
              <xsl:text>-</xsl:text>
            </xsl:when>
            <!-- if any of the fdValues without values and without unknown contains notApplicable, put "not applicable"-->
            <xsl:when test=".//tmp:value[not(contains(@qualifier,'connector'))][@status = 'notApplicable']">
              <xsl:text>n/a</xsl:text>
            </xsl:when>

            <!-- REALLY Shouldn't happen - indicates an untrapped to_ouput problem -->
            <xsl:when test="@error"/>

            <!-- otherwise put unknown. This should not ever occur -->
            <xsl:otherwise>
              <xsl:text>-</xsl:text>
            </xsl:otherwise>
          </xsl:choose>

        </xsl:for-each>

        <xsl:if test="current-group()//@updated = 'y'">
          
        </xsl:if>

      </xsl:element>


    </xsl:for-each-group>

  </xsl:template>

  <xsl:template match="tmp:fdValue">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tmp:conditions">
    <xsl:text> (</xsl:text>
    <xsl:apply-templates/>
    <xsl:text>)</xsl:text>
  </xsl:template>


  <xsl:template match="tmp:appli">
    <xsl:if test="not(preceding-sibling::*:value[1]/@status = ('unknown', 'notApplicable'))">
      <!--<xsl:message>InsRefs: <xsl:value-of select="count(tmp:insRef)"/> instances: <xsl:value-of select="ancestor::tmp:equip/@instances"/></xsl:message>-->
      <xsl:if test="count(tmp:insRef) != number(ancestor::tmp:equip/@instances)">
        <xsl:if test="tmp:insRef[not(. = '')]">

          <xsl:text> (</xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string">
              <xsl:for-each select="tmp:insRef">
                <!-- TMP - may be needed -->
                <xsl:sort select="." order="ascending"/>
                <!--<xsl:message>text: -<xsl:value-of select="text()"/>-</xsl:message>-->
                <xsl:choose>
                  <xsl:when test=". = ''">
                    <!--<xsl:message>Warning: insRef has no text!</xsl:message>-->
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:text>|</xsl:text>
                    <xsl:value-of select="."/>
                    <xsl:text>|</xsl:text>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
            </xsl:with-param>
          </xsl:call-template>
          <xsl:text>) </xsl:text>
        </xsl:if>
      </xsl:if>
    </xsl:if>

    <xsl:if test="following-sibling::*:value[not(@status = ('unknown', 'notApplicable'))]">
      <xsl:element name="br"/>
    </xsl:if>

  </xsl:template>

  <xsl:template match="tmp:br">

    <xsl:element name="br"/>

  </xsl:template>

  <xsl:template match="tmp:narrative">
    <xsl:if test="position() &gt; 1">
      <xsl:element name="br"/>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tmp:narrative[@generated = 'y']">
    <xsl:if test="position() &gt; 1">
      <xsl:element name="br"/>
    </xsl:if>
    <xsl:choose>
      <xsl:when test="tmp:nText">
        <xsl:for-each select="tmp:nText">
          <xsl:if test="preceding-sibling::tmp:nText">
            <br/>
          </xsl:if>
          <xsl:apply-templates select="."/>
          <xsl:apply-templates select="../tmp:nTitle"/>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="tmp:nTitle"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:if test="tmp:narrative">
      <br/>
    </xsl:if>
    <xsl:apply-templates select="tmp:narrative"/>
  </xsl:template>

  <xsl:template match="tmp:nText">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tmp:nTitle">
    <b>
      <xsl:apply-templates/>
    </b>
    <xsl:text>&#160;</xsl:text>
  </xsl:template>

  <xsl:template match="tmp:narrative[@generated = 'y']/tmp:nTitle">
    <xsl:choose>
      <xsl:when test="text() != '' and ../tmp:nText[text() != '']">
        <xsl:text> [</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>] </xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- when we remove unknowns. This should be standard, but previous versions left them in. Entries with only unknowns or not applicable handled elsewhere -->
  <xsl:template match="tmp:value[xs:integer($displayUnknowns) = 0]">

    <xsl:if test="@alpha and @alpha != ''">
      <xsl:if test="position() &gt; 1">
        <br/>
      </xsl:if>
      <b>
        <xsl:value-of select="@alpha"/>:
      </b>
    </xsl:if>

    <xsl:choose>

      <!-- New connector rules from PP -->

      <!-- remove connector from start and end, and use the first if two would end up together -->

      <xsl:when test="contains(@qualifier,'connector')">

        <!-- Examples: 
				3 X 2V, 3A batteries ( X and , are connectors)
				3 X unknown, 3A  => 3 X 3A
				3 X 2V, unknown  => 3 X 2V
				unknown X 2V, 3A => 2V, 3A -->

        <!-- Equivalent rule:
			1) There is a preceding value of some sort that is not unknown/notapplicable
			2) The first preceding value that is not unknown/notapplicable is not a connector
			3) There is some actual value further on -->


        <!-- temporary hack for tyres which uses the 'wrong' connector -->
        <xsl:choose>
          <xsl:when test="ancestor::tmp:group[1]/@label = 'Tyres'">
            <xsl:if test="preceding-sibling::tmp:value[not(@status = ('unknown', 'notApplicable'))] and
						(not(contains(following-sibling::tmp:value[not(@status = ('unknown', 'notApplicable'))][1]/@qualifier, 'connector'))) and
						(following-sibling::tmp:value[not(contains(@qualifier,'connector'))][not(@status = ('unknown', 'notApplicable'))])">
              <xsl:apply-templates/>
              <xsl:if test="following-sibling::*:appli">
                <xsl:element name="br"/>
              </xsl:if>
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:if test="preceding-sibling::tmp:value[not(@status = ('unknown', 'notApplicable'))] and
						(not(contains(preceding-sibling::tmp:value[not(@status = ('unknown', 'notApplicable'))][1]/@qualifier, 'connector'))) and
						(following-sibling::tmp:value[not(contains(@qualifier,'connector'))][not(@status = ('unknown', 'notApplicable'))])">
              <xsl:apply-templates/>
              <xsl:if test="following-sibling::*:appli">
                <xsl:element name="br"/>
              </xsl:if>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>

      </xsl:when>

      <!-- Value rules. -->
      <xsl:otherwise>
        <xsl:choose>
          <!-- New rules from PP -->
          <!-- always remove unknowns. Since unknown is now a status, this is the same as doing nothing -->
          <xsl:when test="@status = 'unknown'"/>
          <!-- always remove not applicable also (previously these were left in) -->
          <xsl:when test="@status = 'notApplicable'"/>
          <!-- Armament remove main and secondary -->
          <xsl:when test="@fdLabel = 'role' and (text() = 'main' or text()='secondary')"/>
          <xsl:otherwise>
            <!-- converted values in brackets -->
            <xsl:if test="@source = 'converted'">(</xsl:if>
            <xsl:apply-templates/>
            <xsl:if test="@gentext">
              <!-- At the moment always putting space before gentext. This may change -->
              <!--<xsl:text>&#160;</xsl:text>-->
              <xsl:call-template name="tidygentext">
                <xsl:with-param name="string" select="@gentext"/>
              </xsl:call-template>
            </xsl:if>

            <!-- estimated value + close ) for converted. Combined because est. will be different -->
            <xsl:choose>
              <xsl:when test="@source = 'converted' and @status = 'estimated'">
                <xsl:text> est.)</xsl:text>
              </xsl:when>
              <xsl:when test="@source = 'converted'">
                <xsl:text>)</xsl:text>
              </xsl:when>
              <xsl:when test="@status = 'estimated'">
                <xsl:text> (est.)</xsl:text>
              </xsl:when>
              <xsl:otherwise/>
            </xsl:choose>

            <!-- spaces only for lists without connectors. This may change -->
            <xsl:if test="following-sibling::tmp:value[not(@status = ('unknown', 'notApplicable'))][1][not(contains(@qualifier,'connector'))]">
              <xsl:text>&#160;</xsl:text>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>


  </xsl:template>

  <!-- Leave the word "unknown" in entries. Also leaves "not applicable" -->
  <xsl:template match="tmp:value[not($displayUnknowns = 0)]">

    <xsl:if test="@source = 'converted'">(</xsl:if>
    <xsl:choose>
      <xsl:when test="@status = 'unknown'">
        <xsl:text>unknown</xsl:text>
      </xsl:when>
      <xsl:when test="@status = 'notApplicable'">
        <xsl:text>not applicable</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="@alpha and @alpha != ''">
          <b>
            <xsl:value-of select="@alpha"/>:
          </b>
        </xsl:if>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
    <!--<xsl:text>&#160;</xsl:text>-->
    <xsl:if test="@gentext">
      <xsl:call-template name="tidygentext">
        <xsl:with-param name="string" select="@gentext"/>
      </xsl:call-template>
    </xsl:if>
    <xsl:if test="@source = 'converted'">)</xsl:if>

    <!-- spaces unless connector or nothing following (or self is a connector). This may change -->
    <xsl:if test="following-sibling::tmp:value[1][not(contains(@qualifier,'connector'))] and not(contains(@qualifier,'connector'))">
      <xsl:text>&#160;</xsl:text>
    </xsl:if>

  </xsl:template>

  <xsl:template match="tmp:column"/>


  <!-- NAMED TEMPLATES -->

  <!-- Recursive Template that groups fdGroups -->
  <xsl:template name="groupit">
    <xsl:param name="xmltogroup"/>
    <xsl:for-each-group select="$xmltogroup/root/tmp:fdGroup" group-by="concat(tmp:fdLabel, 'p', @pos, 'o', @groupOrder)">
      <xsl:element name="tmp:group">
        <!-- This is the name of the field. Because there are no IDs, we have to use this to group by -->
        <xsl:attribute name="label" select="tmp:fdLabel"/>
        <!-- for HTML, level will be used for indentation -->
        <xsl:attribute name="level" select="./tmp:fdLabel[1]/@level"/>

        <xsl:if test="current-group()/@updated = 'y'">
          <xsl:attribute name="updated" select="'y'"/>
        </xsl:if>

        <!-- put all values at this level into a containing 'value-group' element -->
        <xsl:if test="current-group()/tmp:fdValue">
          <xsl:element name="tmp:valuegroup">
            <xsl:for-each select="current-group()">
              <xsl:for-each select="tmp:fdValue">
                <xsl:copy>
                  <xsl:copy-of select="@*"/>
                  <xsl:copy-of select="*"/>
                  <xsl:if test="not(tmp:appli) and ancestor::*/tmp:appli">
                    <xsl:copy-of select="ancestor::*/tmp:appli"/>
                  </xsl:if>
                </xsl:copy>
              </xsl:for-each>

            </xsl:for-each>
          </xsl:element>
        </xsl:if>

        <!-- need to recombine elements in each group in order to group one level further down -->
        <xsl:variable name="newblock">
          <root>
            <xsl:for-each select="current-group()">
              <xsl:for-each select="tmp:fdGroup">
                <xsl:copy>
                  <xsl:copy-of select="@*"/>
                  <xsl:copy-of select="*"/>
                  <xsl:if test="not(tmp:appli) and ancestor::*/tmp:appli">
                    <xsl:copy-of select="ancestor::*/tmp:appli"/>
                  </xsl:if>
                </xsl:copy>
              </xsl:for-each>
            </xsl:for-each>
          </root>
        </xsl:variable>

        <xsl:if test="$newblock/root/tmp:fdGroup">
          <xsl:call-template name="groupit">
            <xsl:with-param name="xmltogroup">
              <xsl:copy-of select="$newblock"/>
            </xsl:with-param>
          </xsl:call-template>
        </xsl:if>


      </xsl:element>
    </xsl:for-each-group>
  </xsl:template>

  <xsl:template name="tidygentext">

    <xsl:param name="string"/>

    <xsl:if test="not($string = ('', ' '))">

      <!-- Remove any spaces from beginning or end -->
      <xsl:variable name="strippedstring" select="normalize-space($string)"/>
      <xsl:variable name="genlookup">
        <root>
          <unit name="%">%</unit>
          <unit name="&#xb0;">&#xb0;</unit>
          <unit name="&#xb0;/s">&#xb0;/s</unit>
        </root>
      </xsl:variable>

      <xsl:choose>
        <xsl:when test="$genlookup/root/unit[@name = $strippedstring]">
          <xsl:value-of select="$genlookup/root/unit[@name = $strippedstring]/text()"/>
        </xsl:when>
        <xsl:otherwise>
          <!--<xsl:message> No unit string for <xsl:value-of select="$strippedstring"/> </xsl:message>-->
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$strippedstring"/>
        </xsl:otherwise>
      </xsl:choose>

    </xsl:if>

  </xsl:template>

  <!-- 2 functions. 1 is to insert column number and equipment name into elements so we can potentially check the grouped output.
2 is to change the namespace to tmp for the internal variable so that we will not be in danger of clashing on names -->
  <xsl:template match="j:fdValue|j:fdGroup|j:fdLabel|j:value|j:appli|j:insRef|j:narrative|j:nTitle|j:nText|j:conditions" mode="merge">

    <xsl:variable name="element" select="local-name()"/>
    <!--<xsl:message>NODE = <xsl:value-of select="$element"/></xsl:message>-->
    <xsl:element name="tmp:{$element}" namespace="http://example.com/InternalContent/">
      <xsl:copy-of select="@*"/>
      <xsl:if test="$element = 'fdGroup'">
        <xsl:attribute name="pos" select="j:fdValue/j:value[@pos][1]/@pos"/>
        <!--<xsl:message>POS: <xsl:value-of select="j:fdValue/j:value[@pos][1]/@pos"/></xsl:message>-->
      </xsl:if>
      <xsl:if test="$element = 'fdValue'">
        <xsl:attribute name="equipname" select="ancestor::j:fd_equipment/j:name"/>
        <xsl:attribute name="column" select="count(ancestor::j:fd_equipment/preceding-sibling::j:fd_equipment) + 1"/>
      </xsl:if>
      <xsl:apply-templates mode="merge"/>
    </xsl:element>

  </xsl:template>

  <!-- Remove grouping fdValues to make future rules easier -->
  <xsl:template match="j:fdValue/j:fdValue" mode="merge">
    <xsl:apply-templates mode="merge"/>
  </xsl:template>

  <!-- ********************** -->
  <!-- END NEW SPECIFICATIONS -->
  <!-- ********************** -->





  <xsl:template match="j:spec">
    <xsl:comment>
      <xsl:call-template name="spec_names">
        <xsl:with-param name='specname' select='j:specName'/>
        <xsl:with-param name='spectype'>comment</xsl:with-param>
      </xsl:call-template>
      <xsl:text disable-output-escaping='yes'> (</xsl:text>
      <xsl:value-of select='j:specValue/@unit'/>
      <xsl:text disable-output-escaping='yes'>)</xsl:text>
    </xsl:comment>
    <tr>
      <td>
        <b>
          <xsl:call-template name="spec_names">
            <xsl:with-param name='specname' select='j:specName'/>
            <xsl:with-param name='spectype'>label</xsl:with-param>
          </xsl:call-template>
          <xsl:text disable-output-escaping='yes'> (</xsl:text>
          <xsl:value-of select='j:specValue/@unit'/>
          <xsl:text disable-output-escaping='yes'>): </xsl:text>
        </b>
      </td>
      <td>
        <xsl:value-of select='j:specValue'/>
      </td>
    </tr>
  </xsl:template>



  <xsl:template name="spec_names">
    <xsl:param name='specname'/>
    <xsl:param name='spectype'/>
    <xsl:choose>
      <xsl:when test='normalize-space($specname) = "Disp. dived"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>DISP.DIVED</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Displacement Dived</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Disp. full load"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>DISP.FULL LOAD</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Displacement Full Load</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Disp. standard"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>DISP.STANDARD</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Displacement Standard</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Disp. surfaced"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>DISP.SURFACED</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Displacement Surfaced</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Meas. dwt"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>MEAS.DWT</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Measurement Deadweight</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Meas. gross"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>MEAS.GROSS</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Measurement Gross</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test='normalize-space($specname) = "Meas. net"'>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:text>MEAS.NET</xsl:text>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:text>Measurement Net</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test='$spectype = "comment"'>
            <xsl:value-of select='translate($specname,"abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ")'/>
          </xsl:when>
          <xsl:when test='$spectype = "label"'>
            <xsl:value-of select='$specname'/>
          </xsl:when>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>



  <!--
###############################
HTML/HEAD template Yearbook
###############################
-->

  <!-- 
###############################
HTML/HEAD/TITLE
###############################
-->


  <xsl:template match="j:render">
    <xsl:choose>
      <xsl:when test="@appearance = 'italic'">
        <i>
          <xsl:apply-templates/>
        </i>
      </xsl:when>
      <xsl:when test="@appearance = 'bold'">
        <b>
          <xsl:apply-templates/>
        </b>
      </xsl:when>
      <xsl:when test="@appearance = 'boldItalic'">
        <b>
          <i>
            <xsl:apply-templates/>
          </i>
        </b>
      </xsl:when>
      <xsl:when test="@appearance = 'smallCaps'">
        <b>
          <u>
            <xsl:apply-templates/>
          </u>
        </b>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template match='j:metadata'/>
  <xsl:template match='j:mediaBlock'/>


  <!-- *****TITLES***** -->

  <xsl:template match='j:record/j:title'/>

  <xsl:template match='j:record/j:shortTitle'/>

  <xsl:template match='j:sect1'>
    <xsl:choose>
      <xsl:when test="j:title[@qualifier='specifications'] or j:title = 'Specifications' or @objname='Specifications'">

        <br/>
        <xsl:apply-templates />
        <br/>

      </xsl:when>
      <xsl:when test="j:title[@qualifier='KeyPersonnel'] or j:title = 'Key Personnel' or @objname='KeyPersonnel'">
        <br/>
        <xsl:apply-templates />
      </xsl:when>

      <xsl:when test="@qualifier = 'disclaimer'">
        <xsl:apply-templates select="*[ not(name() = 'janes:metadata') ]"/>
      </xsl:when>
      <xsl:when test="@qualifier = 'event'">
        <table border="1" width="100%">
          <xsl:choose>
            <xsl:when test="janes:title and not(janes:title = ('', ' '))">

              <tr>
                <td bgcolor="#EBEBEB">
                  <xsl:apply-templates select="janes:title"/>
                </td>
              </tr>
              <tr>
                <td>
                  <xsl:apply-templates select="*[ not(name() = 'janes:title') ]"/>
                </td>
              </tr>
            </xsl:when>
            <xsl:otherwise>
              <tr>
                <td>
                  <xsl:apply-templates/>
                </td>
              </tr>
            </xsl:otherwise>
          </xsl:choose>
        </table>
      </xsl:when>

      <xsl:when test="@qualifier = 'keyPoints'">
        <table bgcolor="#EBEBEB" border="1" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td>
              <xsl:apply-templates/>
            </td>
          </tr>
        </table>
      </xsl:when>
      <xsl:when test="@qualifier = 'box'">
        <table border="1" width="100%">
          <xsl:choose>
            <xsl:when test="janes:title and not(janes:title = ('', ' '))">

              <tr>
                <td bgcolor="#EBEBEB">
                  <xsl:apply-templates select="janes:title"/>
                </td>
              </tr>
              <tr>
                <td>
                  <xsl:apply-templates select="*[ not(name() = 'janes:title') ]"/>
                </td>
              </tr>
            </xsl:when>
            <xsl:otherwise>
              <tr>
                <td>
                  <xsl:apply-templates/>
                </td>
              </tr>
            </xsl:otherwise>
          </xsl:choose>
        </table>
      </xsl:when>
      <xsl:when test="@qualifier = 'breakout'">
        <table bgcolor="#EBEBEB" border="1" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td>
              <xsl:apply-templates select="*[not(name() = 'janes:authoredBy')]"/>
              <xsl:apply-templates select="janes:authoredBy"/>
            </td>
          </tr>
        </table>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='j:sect2[@qualifier="specifications"]'>

    <xsl:apply-templates />

  </xsl:template>

  <xsl:template match='j:sect3[@qualifier="specifications"]'>

    <xsl:apply-templates />

  </xsl:template>

  <xsl:template match='j:record/j:keyPersonnel'>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match='j:address'>

    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match='j:dataGroup'>


    <xsl:apply-templates/>
    <br/>
  </xsl:template>

  <!-- JAHA Prelim special double lists -->
  <xsl:template match="j:address/j:para">
    <div>
    <xsl:apply-templates/>
    </div>
  </xsl:template>


  <xsl:template match="j:address/j:doubleList">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="j:address/j:doubleList/j:first">

        <xsl:apply-templates/>

  </xsl:template>


  <xsl:template match="j:address/j:doubleList/j:second">
    <xsl:text>&#160;</xsl:text>

        <xsl:choose>
          <xsl:when test='position() = last()'>
            <xsl:apply-templates/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates/>
            <br/>

          </xsl:otherwise>
        </xsl:choose>

  </xsl:template>

  <xsl:template match="j:address/j:doubleList/j:second/j:para">
    <xsl:if test="position() > 1">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:template>


  <xsl:template match='j:dataGroup/j:keyPersonnel'>
    <p>
      <xsl:apply-templates />
    </p>
  </xsl:template>

  <xsl:template match='j:dataGroup/j:title'>
    <p>
      <b>
        <xsl:apply-templates />
      </b>
    </p>
  </xsl:template>

  <xsl:template match='j:dataGroup/j:para'>
    <p>
        <xsl:apply-templates/>
    </p>
  </xsl:template>

  <xsl:template match='j:organisation'>
    <xsl:choose>
      <xsl:when test='@index="Y"'>


        <xsl:apply-templates/>


      </xsl:when>
      <xsl:when test='@index="N"'>
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <p>
          <xsl:apply-templates/>
        </p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>



  <xsl:template name="H1.title">
    <xsl:param name="H1title" select="."/>
    <h1>
      <xsl:value-of select="$H1title"/>
    </h1>
  </xsl:template>

  <xsl:template name="H2.title">
    <xsl:param name="H2title" select="."/>
    <h2>
      <xsl:value-of select="$H2title"/>
    </h2>
  </xsl:template>

  <xsl:template name="H3.title">
    <xsl:param name="H3title" select="."/>
    <h3>
      <xsl:value-of select="$H3title"/>
    </h3>
  </xsl:template>

  <xsl:template name="H4.title">
    <xsl:param name="H4title" select="."/>
    <h4>
      <xsl:value-of select="$H4title"/>
    </h4>
  </xsl:template>

  <xsl:template name="bu.title">
    <xsl:param name="butitle" select="."/>
    <xsl:choose>
      <xsl:when test="@delivery='none'">
        <p/>
      </xsl:when>
      <xsl:otherwise>
        <p>
          <xsl:choose>
            <xsl:when test='parent::j:sect1[not(@qualifier = ("box", "event", "keyPoints", "breakout"))]'>
              <b>
                <u>
                  <xsl:value-of select="$butitle"/>
                </u>
              </b>
            </xsl:when>
            <xsl:otherwise>
              <b>
                <xsl:value-of select="$butitle"/>
              </b>
            </xsl:otherwise>
          </xsl:choose>

          <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
        </p>

      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template name="bu.notag.title">
    <xsl:param name="butitle" select="."/>
    <xsl:choose>
      <xsl:when test="@delivery='none'">
        <p/>
      </xsl:when>
      <xsl:otherwise>
        <p>
          <xsl:choose>
            <xsl:when test='parent::j:sect1[not(@qualifier = ("box", "event", "keyPoints", "breakout"))]'>
              <b>
                <u>
                  <xsl:value-of select="$butitle"/>
                </u>
              </b>
            </xsl:when>
            <xsl:otherwise>
              <b>
                <xsl:value-of select="$butitle"/>
              </b>
            </xsl:otherwise>
          </xsl:choose>
        </p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="bu.h3.title">
    <xsl:param name="butitle" select="."/>
    <xsl:choose>
      <xsl:when test="@delivery='none'">
        <p/>
      </xsl:when>
      <xsl:otherwise>
        <p>
          <xsl:choose>
            <xsl:when test='@qualifier="type"'>
              <font size="4">
                <b>
                  <xsl:value-of select="$butitle"/>
                </b>
              </font>
            </xsl:when>
            <xsl:when test='parent::j:sect1[not(@qualifier = ("box", "event", "keyPoints", "breakout"))]'>
              <h3>
                <b>
                  <u>
                    <xsl:value-of select="$butitle"/>
                  </u>
                </b>
              </h3>
            </xsl:when>
            <xsl:otherwise>
              <h3>
                <b>
                  <xsl:value-of select="$butitle"/>
                </b>
              </h3>
            </xsl:otherwise>
          </xsl:choose>
        </p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="other.title">
    <xsl:param name="othertitle" select="."/>
    <p>
      <b>
        <i>
          <xsl:value-of select="$othertitle"/>
        </i>
      </b>
    </p>
  </xsl:template>

  <xsl:template name="bold.space">
    <xsl:param name="boldspace" select="."/>
    <b>
      <xsl:value-of select="$boldspace"/>
      <xsl:text>&#160;</xsl:text>
    </b>
  </xsl:template>

  <xsl:template match='j:label'>
    <b>
      <xsl:apply-templates/>
    </b>
    <xsl:text>&#160;</xsl:text>
  </xsl:template>

  <xsl:template match='j:sect1[@qualifier="glossary"]'>
    <h2>Glossary</h2>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match='j:sect2[@qualifier="box"]'>
    <xsl:choose>
      <xsl:when test='j:table'>
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
          <table>
            <xsl:attribute name="border">1</xsl:attribute>
            <xsl:if test='@objname="KeyFacts"'>
              <xsl:attribute name="cellspacing">0</xsl:attribute>
              <xsl:attribute name="cellpadding">3</xsl:attribute>
              <xsl:attribute name="bgcolor">#EBEBEB</xsl:attribute>
            </xsl:if>
            <tr>
              <td valign="top">
                <xsl:apply-templates/>
              </td>
            </tr>
          </table>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='j:sect2[@qualifier="box"]/j:sect3/j:para'>
        <xsl:apply-templates/>
        <br/>
  </xsl:template>

  <xsl:template match='j:sub'>
    <sub>
      <xsl:apply-templates/>
    </sub>
  </xsl:template>

  <xsl:template match='j:sup'>
    <sup>
      <xsl:apply-templates/>
    </sup>
  </xsl:template>

  <xsl:template match='j:doubleList[@qualifier = ("glossary", "CreditCards") ]'>
    <xsl:if test='not (name(parent) = "j:second")'>
      <table border="0">
        <xsl:if test='j:title'>
          <tr>
            <th bgcolor="#EBEDED" colspan="2">
              <xsl:apply-templates select="j:title"/>
            </th>
          </tr>
        </xsl:if>
        <xsl:for-each select='j:first'>
          <tr>
            <td valign="top" align="left">
              <xsl:apply-templates/>
            </td>
            <td valign="top" align="left">
              <xsl:apply-templates select='following-sibling::j:second[1]'/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>
  </xsl:template>

  <xsl:template match='j:doubleList[@qualifier="abbreviation"]'>
    <xsl:if test='not (name(parent) = "j:second")'>
      <table border="0">
        <xsl:if test='j:title'>
          <tr>
            <th bgcolor="#EBEDED" colspan="2">
              <xsl:apply-templates select="j:title"/>
            </th>
          </tr>
        </xsl:if>
        <xsl:for-each select='j:first'>
          <tr>
            <td valign="top" align="left">
              <xsl:apply-templates/>
            </td>
            <td valign="top" align="left">
              <xsl:apply-templates select='following-sibling::j:second[1]'/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>
  </xsl:template>

  <xsl:template match='j:doubleList[@qualifier="simpleIndent"]'>
    <xsl:choose>
      <xsl:when test='not(parent::j:second)'>
        <table border="0">
          <xsl:if test='j:title'>
            <tr>
              <th bgcolor="#EBEDED" colspan="2">
                <xsl:apply-templates select="j:title"/>
              </th>
            </tr>
          </xsl:if>
          <xsl:for-each select='j:first'>
            <tr>
              <td valign="top" align="left">
                <xsl:apply-templates/>
              </td>
              <td valign="top" align="left">
                <xsl:apply-templates select='following-sibling::j:second[1]'/>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text disable-output-escaping="yes">&lt;/td&gt;&lt;/tr&gt;</xsl:text>

        <xsl:for-each select='j:first'>
          <tr>
            <td valign="top" align="left">
              <xsl:text>&#160;&#160;</xsl:text>
              <xsl:apply-templates/>
            </td>
            <td valign="top" align="left">
              <xsl:apply-templates select='following-sibling::j:second[1]'/>
            </td>
          </tr>
        </xsl:for-each>
        <xsl:text disable-output-escaping="yes">&lt;tr&gt;&lt;td&gt;</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='j:doubleList[@qualifier="keyPersonnel"]'>
    <xsl:choose>
      <xsl:when test='not(parent::j:second)'>
        <table border="1">
          <xsl:if test='j:title'>
            <tr>
              <th bgcolor="#EBEDED" colspan="2">
                <xsl:apply-templates select="j:title"/>
              </th>
            </tr>
          </xsl:if>
          <xsl:for-each select='j:first'>
            <tr>
              <td valign="top" align="left">
                <xsl:apply-templates/>
              </td>
              <td valign="top" align="left">
                <xsl:apply-templates select='following-sibling::j:second[1]'/>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text disable-output-escaping="yes">&lt;/td&gt;&lt;/tr&gt;</xsl:text>

        <xsl:for-each select='j:first'>
          <tr>
            <td valign="top" align="left">
              <xsl:text>&#160;&#160;</xsl:text>
              <xsl:apply-templates/>
            </td>
            <td valign="top" align="left">
              <xsl:apply-templates select='following-sibling::j:second[1]'/>
            </td>
          </tr>
        </xsl:for-each>
        <xsl:text disable-output-escaping="yes">&lt;tr&gt;&lt;td&gt;</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="j:keyPersonnel/j:doubleList/j:second/j:para">
        <xsl:apply-templates/>
        <xsl:if test='following-sibling::j:para'>
          <br/>
        </xsl:if>
  </xsl:template>


  <xsl:template match="j:url">
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="@xlink:href"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>



  <xsl:template match='j:list'>
    <xsl:choose>
      <xsl:when test='@type="number"'>
        <xsl:if test='parent::j:sect1 or parent::j:sect2 or parent::j:sect3 or parent::j:sect4 or parent::j:sect5 or parent::j:sectN'>
          <ol>
            <xsl:for-each select='child::j:listItem'>
              <li type="1">
                <xsl:for-each select='./j:para'>

                      <xsl:choose>
                        <xsl:when test='count(preceding-sibling)=0'>
                          <xsl:value-of select='.'/>
                        </xsl:when>
                        <xsl:otherwise>
                          <br/>
                          <xsl:value-of select='.'/>
                        </xsl:otherwise>
                      </xsl:choose>

                </xsl:for-each>
                <xsl:for-each select='child::j:list'>
                  <ol>
                    <xsl:for-each select='child::j:listItem'>
                      <li type="a">
                        <xsl:for-each select='./j:para'>

                              <xsl:choose>
                                <xsl:when test='count(preceding-sibling)=0'>
                                  <xsl:value-of select='.'/>
                                </xsl:when>
                                <xsl:otherwise>
                                  <br/>
                                  <xsl:value-of select='.'/>
                                </xsl:otherwise>
                              </xsl:choose>

                        </xsl:for-each>
                        <xsl:for-each select='child::j:list'>
                          <ol>
                            <xsl:for-each select='child::j:listItem'>
                              <li type="i">
                                <xsl:for-each select='./j:para'>

                                      <xsl:choose>
                                        <xsl:when test='count(preceding-sibling)=0'>
                                          <xsl:value-of select='.'/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                          <br/>
                                          <xsl:value-of select='.'/>
                                        </xsl:otherwise>
                                      </xsl:choose>

                                </xsl:for-each>
                              </li>
                            </xsl:for-each>
                          </ol>
                        </xsl:for-each>
                      </li>
                    </xsl:for-each>
                  </ol>
                </xsl:for-each>
              </li>
            </xsl:for-each>
          </ol>
        </xsl:if>
      </xsl:when>
      <xsl:when test='@type="bullet"'>
        <xsl:if test='parent::j:sect1 or parent::j:sect2 or parent::j:sect3 or parent::j:sect4 or parent::j:sect5 or parent::j:sectN or parent::j:entry'>

          <ul>
            <xsl:for-each select='child::j:listItem'>
              <li>
                <xsl:for-each select='./j:para'>

                      <xsl:choose>
                        <xsl:when test='count(preceding-sibling)=0'>
                          <xsl:apply-templates select='.'/>
                        </xsl:when>
                        <xsl:otherwise>
                          <br/>
                          <xsl:apply-templates select='.'/>
                        </xsl:otherwise>
                      </xsl:choose>

                </xsl:for-each>
                <xsl:for-each select='child::j:list'>
                  <ul>
                    <xsl:for-each select='child::j:listItem'>
                      <li>
                        <xsl:for-each select='./j:para'>

                              <xsl:choose>
                                <xsl:when test='count(preceding-sibling)=0'>
                                  <xsl:apply-templates select='.'/>
                                </xsl:when>
                                <xsl:otherwise>
                                  <br/>
                                  <xsl:apply-templates select='.'/>
                                </xsl:otherwise>
                              </xsl:choose>

                        </xsl:for-each>
                        <xsl:for-each select='child::j:list'>
                          <ul>
                            <xsl:for-each select='child::j:listItem'>
                              <li>
                                <xsl:for-each select='./j:para'>
 
                                      <xsl:choose>
                                        <xsl:when test='count(preceding-sibling)=0'>
                                          <xsl:apply-templates select='.'/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                          <br/>
                                          <xsl:apply-templates select='.'/>
                                        </xsl:otherwise>
                                      </xsl:choose>
                                </xsl:for-each>
                              </li>
                            </xsl:for-each>
                          </ul>
                        </xsl:for-each>
                      </li>
                    </xsl:for-each>
                  </ul>
                </xsl:for-each>
              </li>
            </xsl:for-each>
          </ul>
        </xsl:if>
      </xsl:when>

      <xsl:when test='@type="simple" and parent::*[local-name() = "relatedInfo"]'>
        <xsl:if test='./j:title'>
          <b>
            <xsl:apply-templates select='./j:title'/>
          </b>
          <br/>
        </xsl:if>

        <xsl:for-each select='j:listItem'>
          <xsl:choose>
            <xsl:when test='following-sibling::j:listItem'>
              <xsl:apply-templates select='.'/>
              <br/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:apply-templates select='.'/>
            </xsl:otherwise>
          </xsl:choose>

        </xsl:for-each>
      </xsl:when>

      <xsl:when test='@type="simple"'>
        <div>
          <xsl:if test='./j:title'>
            <div>
              <b>
                <xsl:apply-templates select='./j:title'/>
              </b>
            </div>
          </xsl:if>

          <xsl:for-each select='j:listItem'>
            <div>
            <xsl:choose>
              <xsl:when test='following-sibling::j:listItem'>
                <xsl:apply-templates select='.'/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:apply-templates select='.'/>
              </xsl:otherwise>
            </xsl:choose>
            </div>
          </xsl:for-each>
        </div>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <!--
<xsl:template match='j:table//j:link[@qualifier="noteRef"]' priority="2"> 
	<xsl:variable name="ref" select="@xlink:href"/>
    <a>
        <xsl:attribute name="href">
            <xsl:text>#</xsl:text>
            <xsl:value-of select="$ref"/>
        </xsl:attribute>
        <sup><xsl:value-of select="index-of(distinct-values(ancestor::j:table//j:link[@qualifier='noteRef']/@xlink:href), $ref)"/></sup>
    </a>
</xsl:template>

<xsl:template match='j:list//j:link[@qualifier="noteRef"]' priority="1.5"> 
	<xsl:variable name="ref" select="@xlink:href"/>
    <a>
        <xsl:attribute name="href">
            <xsl:text>#</xsl:text>
            <xsl:value-of select="$ref"/>
        </xsl:attribute>
        <sup><xsl:value-of select="index-of(distinct-values(ancestor::j:list//j:link[@qualifier='noteRef']/@xlink:href), $ref)"/></sup>
    </a>
</xsl:template>
-->

  <!-- Links redone for Table Footnotes project (28/1/2010) to allow editors to change notes in EPIC without manual intervention -->
  <!-- Change means that link refs are not in order on the page. -->
  <xsl:template match="j:link[@qualifier='noteRef' or @qualifier='noteref']" priority="2">
    <xsl:variable name="hrefid" select="@xlink:href"/>

    <xsl:choose>
      <!-- If linktext doesn't exist already -->
      <xsl:when test="not(j:linkText) or j:linkText = ''">
        <!-- Find all notes with a matching ID (wherever they appear) -->
        <xsl:for-each select="ancestor::j:record/descendant::j:noteGroup[@qualifier='number']/j:note[@id = $hrefid ]">
          <!-- This bit finds the number of the note in relation to the notes on the same level, ie the number to add in as a reference -->
          <xsl:variable name="nr">
            <xsl:number count="j:note" level="single"/>
          </xsl:variable>
          <!-- Create the link -->
          <xsl:element name="a">
            <xsl:attribute name="href">
              #<xsl:value-of select="$hrefid"/>
            </xsl:attribute>
            <!-- If there are multiple notes with the same ID, add in comma -->
            <sup>
              <xsl:value-of select="$nr"/>
              <xsl:if test="not(position() = last())">
                <xsl:text>,</xsl:text>
              </xsl:if>
            </sup>
          </xsl:element>
          <!-- If there are multiple notes with the same ID, add in space (not in link to avoid unsightly underline) -->
          <xsl:if test="not(position() = last())">
            <xsl:text>&#160;</xsl:text>
          </xsl:if>
        </xsl:for-each>
      </xsl:when>
      <!-- Otherwise (if linktext exists), use that and do not renumber -->
      <xsl:otherwise>
        <xsl:element name="a">
          <xsl:attribute name="href">
            #<xsl:value-of select="$hrefid"/>
          </xsl:attribute>
          <xsl:apply-templates/>
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>

    <!-- For multiple reference links to different notes, add in punctuation ONLY if nothing already between the links-->
    <xsl:if test="following-sibling::node()[1][local-name() = 'link'][@qualifier='noteRef' or @qualifier='noteref']">
      <sup>
        <xsl:text>, </xsl:text>
      </sup>
    </xsl:if>

  </xsl:template>

  <!--
<xsl:template match='j:link[@qualifier="noteRef"]'>
    <a>
        <xsl:attribute name="href">
            <xsl:text>#</xsl:text>
            <xsl:value-of select="@xlink:href"/>
        </xsl:attribute>
    </a>
</xsl:template>

<xsl:template match='j:link[@qualifier="noteref"]'>
    <a>
        <xsl:attribute name="href">
            <xsl:value-of select="@xlink:href"/>
        </xsl:attribute>
    </a> 
</xsl:template>
-->

  <xsl:template match='j:link[@qualifier="spreadsheet"]'>
    <!-- just in case it's needed in the future.  Also think about the image count, if there needs to be a spreadsheet count as well
	
-->
    <a>
      <xsl:attribute name="href">
        <xsl:value-of select="@xlink:href"/>
      </xsl:attribute>
      <xsl:apply-templates select="j:linkText"/>
    </a>
    <!--
	
-->
  </xsl:template>

  <xsl:template match='j:link[@qualifier=("pdf", "presentation", "video", "audio")]'>
    <!-- just in case it's needed in the future.  Also think about the image count, if there needs to be a pdf count as well
  
-->
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="concat($nimagebs, @xlink:href)"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
    <!--
  
-->
  </xsl:template>

  <xsl:template name='emit-note-cardinality'>
    <xsl:param name='note'/>
    <xsl:param name='note-host'/>
    <xsl:param name='owned-notes'/>
    <xsl:variable name='contained-links' select='$note-host//j:link'/>
    <xsl:for-each select='$note-host//j:link'>
      <!-- get what the link is to -->
      <!-- <xsl:variable name='target' select='id(@xlink:href)'/> -->
      <!-- is it one of the owned notes? -->
      <!-- <xsl:variable name='intersect' select='set:intersection($target,$owned-notes)'/> -->

    </xsl:for-each>

  </xsl:template>


  <xsl:template name='process-note'>
    <xsl:param name='note-node'/>
    <xsl:param name='anchor-node'/>
    <xsl:variable name='anchor-owner-node' select='id($note-node/@xlink:href)'/>
    <xsl:variable name='owned-note-list' select='$note-node/../j:note[@xlink:href=$note-node/@xlink:href]'/>
    <!--<xsl:message>Processing note belonging to: <xsl:value-of select='name($anchor-owner-node)'/></xsl:message>-->
    <xsl:call-template name='emit-note-cardinality'>
      <xsl:with-param name='note-host' select='$anchor-owner-node'/>
      <xsl:with-param name='owned-notes' select='$owned-note-list'/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match='j:para'>
        <xsl:choose>
          <xsl:when test='parent::j:entry or ancestor::j:sect1[@qualifier = ("box", "event", "keyPoints", "breakout")]'>

            <xsl:choose>
              <xsl:when test='@indentLevel'>
                <p>
                  <xsl:call-template name="applyIndents"/>
                  <xsl:apply-templates/>
                </p>
              </xsl:when>
              <xsl:otherwise>
                <p>
                  <xsl:apply-templates/>
                </p>  
                  <xsl:if test='following-sibling::j:para'>
                    <p>&#160;</p>
                  </xsl:if>               
              </xsl:otherwise>
            </xsl:choose>
                        
          </xsl:when>
          <xsl:when test='parent::j:sect1 or parent::j:sect2 or parent::j:sect3 or parent::j:sect4 or parent::j:sect5 or parent::j:sectN or parent::j:record or following-sibling::j:para or preceding-sibling::j:para'>
            <p>
              <xsl:if test='@indentLevel'>
                <xsl:call-template name="applyIndents"/>
              </xsl:if>
              <xsl:apply-templates/>
            </p>
          </xsl:when>
          <xsl:otherwise>
            <span>
              <xsl:apply-templates/>
            </span>
          </xsl:otherwise>
        </xsl:choose>
  </xsl:template>


  <xsl:template name="applyIndents">

    <xsl:choose>
      <xsl:when test="matches(@indentLevel, '^[1-9]$')">
        <xsl:attribute name="style">
          <xsl:text>margin-left: </xsl:text>
          <xsl:value-of select="xs:integer(@indentLevel) * 20"/>
          <xsl:text>px</xsl:text>
        </xsl:attribute>
      </xsl:when>
      <xsl:otherwise>
        <xsl:attribute name="style">
          <xsl:text>margin-left: </xsl:text>
          <xsl:value-of select="25"/>
          <xsl:text>px</xsl:text>
        </xsl:attribute>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <xsl:template match='j:br'>
    <br/>
  </xsl:template>



  <xsl:template match="j:note">
    <xsl:choose>
      <xsl:when test="@qualifier = 'general'">
        <p>
          <xsl:apply-templates/>
        </p>
      </xsl:when>
      <xsl:otherwise>
        <li>
          <a>
            <xsl:attribute name="name">
              <xsl:value-of select="@id"/>
            </xsl:attribute>
          </a>
          <xsl:apply-templates/>
        </li>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='j:note' mode='para'>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match='j:noteGroup/j:title' mode='para'>
    <xsl:apply-templates/>
    <br/>
  </xsl:template>

  <xsl:template match="j:noteGroup">
    <xsl:choose>
      <xsl:when test='@qualifier="general" and parent::j:entry'>
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:when test='@qualifier="number"' >
        <xsl:apply-templates select="*[not(local-name() = 'note')]"/>
        <ol type="1">
          <xsl:apply-templates select="j:note"/>
        </ol>
      </xsl:when>
      <xsl:when test='parent::j:sect1 or parent::j:sect2 or parent::j:sect3 or parent::j:sect4 or parent::j:sect5 or parent::j:sectN'>
        <xsl:apply-templates mode="para"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="*[not(local-name() = 'note')]"/>
        <ol type="1" style="score-spaces: false; font-style: italic">
          <xsl:apply-templates select="j:note"/>
        </ol>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template match='j:record//j:mediaBlock'>
    <xsl:if test='preceding-sibling::j:para or preceding-sibling::j:table'>

    </xsl:if>
    <xsl:choose>
      <xsl:when test="j:mediaObject[@vurl = 'unknown']"/>
      <xsl:when test="j:videoObject[@vurl = 'unknown']"/>
      <xsl:otherwise>
        <table>
          <tr>
            <td width="75%">
              <xsl:choose>
                <xsl:when test='j:videoObject'/>
                <xsl:when test="j:mediaObject[@type='video']"/>
                <xsl:when test='j:mediaObject'>
                  <xsl:message>
                    Doing image type = <xsl:value-of select="j:mediaObject/@imageType"/>
                  </xsl:message>
                  <xsl:call-template name="image">
                  </xsl:call-template>
                </xsl:when>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td width = "25%" valign="middle">
              <i>
                <xsl:choose>
                  <xsl:when test="count(j:caption) &lt; 1">
                    <xsl:value-of select="../j:title[1]"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="j:caption"/>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:if test="j:videoObject/@credit"/>
                <xsl:choose>
                  <xsl:when test="j:videoObject/@credit"/>
                  <xsl:when test='j:mediaObject[@type="video"]'>
                    <xsl:if test="j:mediaObject/@credit">
                      <xsl:text> (</xsl:text>
                      <xsl:value-of select="j:mediaObject/@credit"/>
                      <xsl:text>)</xsl:text>
                    </xsl:if>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:if test="j:mediaObject/@credit">
                      <xsl:text> (</xsl:text>
                      <xsl:value-of select="j:mediaObject/@credit"/>
                      <xsl:text>)</xsl:text>
                    </xsl:if>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:for-each select='j:doubleList'>
                  <br/>
                  <table border="0">
                    <xsl:if test='j:title'>
                      <tr>
                        <th bgcolor="#EBEDED" colspan="2">
                          <xsl:apply-templates select="j:title"/>
                        </th>
                      </tr>
                    </xsl:if>
                    <xsl:for-each select='j:first'>
                      <tr>
                        <td valign="top" align="left">
                          <i>
                            <xsl:apply-templates/>
                          </i>
                        </td>
                        <td valign="top" align="left">
                          <i>
                            <xsl:apply-templates select='following-sibling::j:second[1]'/>
                          </i>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </table>
                </xsl:for-each>
                <p align="right">
                  <xsl:value-of select="j:mediaObject/@vurl"/>
                </p>
              </i>
            </td>
          </tr>
        </table>
      </xsl:otherwise>

    </xsl:choose>
    <br/>
  </xsl:template>

  <xsl:template match='j:record//j:mediaObject'>
  </xsl:template>


  <xsl:template match="j:record/@pubabbrev">
  </xsl:template>


  <!--               Start of Named Template Additions                       -->
  <!-- This takes the content result, and splits every 250 characters, -->
  <xsl:template name="doElements">
    <xsl:param name="name"/>
    <xsl:param name="tcontent"/>
    <xsl:param name="suffix"/>
    <xsl:param name="comment"/>

    <xsl:if test="not(matches($tcontent, '^ *$'))">
      <xsl:choose>
        <xsl:when test="string-length($tcontent) &gt; 250">

          <!-- Establish up to the last | before 250 characters -->
          <xsl:variable name="prefix">
            <xsl:analyze-string select='substring($tcontent, 0, 250)' regex='^(.+)\|[^|]*$'>
              <xsl:matching-substring>
                <xsl:value-of select="regex-group(1)"/>
              </xsl:matching-substring>
              <xsl:non-matching-substring>
                <xsl:message>Error! No pipe in over 250 characters</xsl:message>
                <xsl:message>
                  Content: <xsl:value-of select="substring($tcontent, 0, 250)"/>
                </xsl:message>
              </xsl:non-matching-substring>
            </xsl:analyze-string>
          </xsl:variable>

          <!--          <xsl:message>Prefix: <xsl:value-of select="$prefix"/>  END</xsl:message> -->

          <!-- optional comment to be inserted e.g. GIS, CLASSIFICATION -->
          <xsl:if test="not($comment = ('',' '))">
            <xsl:comment>
              <xsl:value-of select="concat(' ', $comment, ' ')"/>
            </xsl:comment>
          </xsl:if>
          <xsl:element name="META">
            <xsl:attribute name="NAME" select="concat($name, $suffix)"/>
            <xsl:attribute name="CONTENT">
              <xsl:value-of select="replace($prefix, '&amp;', ' AND ')"/>
            </xsl:attribute>
          </xsl:element>
          <xsl:if test="not($comment = ('',' '))">
            <xsl:comment>
              <xsl:value-of select="concat(' /', $comment, ' ')"/>
            </xsl:comment>
          </xsl:if>

          <!-- recurse with suffix of one more -->
          <xsl:call-template name="doElements">
            <xsl:with-param name="name" select="$name"/>
            <xsl:with-param name="tcontent">
              <xsl:value-of select="substring-after($tcontent, concat($prefix, '|'))"/>
            </xsl:with-param>
            <xsl:with-param name="suffix">
              <xsl:choose>
                <xsl:when test="$suffix = ''">
                  <xsl:value-of select="'1'"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="xs:string(xs:integer($suffix) + 1)"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:with-param>
            <xsl:with-param name="comment" select="$comment"/>
          </xsl:call-template>

        </xsl:when>

        <xsl:otherwise>
          <xsl:if test="not($comment = ('',' '))">
            <xsl:comment>
              <xsl:value-of select="concat(' ', $comment, ' ')"/>
            </xsl:comment>
          </xsl:if>
          <xsl:element name="META">
            <xsl:attribute name="NAME" select="concat($name, $suffix)"/>
            <xsl:attribute name="CONTENT">
              <!-- not necessary for current use -->
              <xsl:value-of select="$tcontent"/>
            </xsl:attribute>
          </xsl:element>
          <xsl:if test="not($comment = ('',' '))">
            <xsl:comment>
              <xsl:value-of select="concat(' /', $comment, ' ')"/>
            </xsl:comment>
          </xsl:if>

        </xsl:otherwise>

      </xsl:choose>

    </xsl:if>
  </xsl:template>

  <xsl:template name="chompVariants">
    <xsl:param name="string"/>


    <xsl:variable name="firstvariant" select="substring-before(substring-after($string, '|'), '|')"/>
    <xsl:variable name="prefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$firstvariant"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="firstvalue">
      <xsl:choose>
        <xsl:when test="$prefix = 'NO PREFIX'">
          <xsl:value-of select="$firstvariant"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="substring-after($firstvariant, $prefix)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!--<xsl:text>FV: </xsl:text><xsl:value-of select="$firstvalue"/>-->

    <xsl:choose>

      <xsl:when test="$prefix = ''"/>

      <xsl:when test="$firstvalue = ''">

        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $firstvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvariant"/>
          <xsl:with-param name="lastvalue" select="$firstvariant"/>
        </xsl:call-template>

        <xsl:variable name="remnant">
          <xsl:call-template name="returnVariantBlock">
            <xsl:with-param name="string" select="$string"/>
            <xsl:with-param name="prefix" select="$prefix"/>
            <xsl:with-param name="mode" select="'words'"/>
          </xsl:call-template>
        </xsl:variable>

        <xsl:if test="$remnant != ''">
          <xsl:text>, </xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string" select="$remnant"/>
          </xsl:call-template>
        </xsl:if>

      </xsl:when>
      <xsl:otherwise>

        <xsl:if test="$prefix != 'NO PREFIX'">
        <xsl:value-of select="$prefix"/>
          <xsl:text> </xsl:text>
        </xsl:if>

        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $firstvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="number($firstvalue)"/>
        </xsl:call-template>

        <xsl:variable name="remnant">
          <xsl:call-template name="returnVariantBlock">
            <xsl:with-param name="string" select="$string"/>
            <xsl:with-param name="prefix" select="$prefix"/>
            <xsl:with-param name="mode" select="'pennant'"/>
          </xsl:call-template>
        </xsl:variable>

        <xsl:if test="$remnant != ''">
          <xsl:text>, </xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string" select="$remnant"/>
          </xsl:call-template>
        </xsl:if>

      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="chompPrefix">
    <xsl:param name="string"/>
    <xsl:choose>
      <xsl:when test="translate($string, '0123456789', '') = ''">
        <xsl:text>NO PREFIX</xsl:text>
      </xsl:when>
      <xsl:when test="
		substring($string, string-length($string)) = '0' or
		substring($string, string-length($string)) = '1' or
		substring($string, string-length($string)) = '2' or
		substring($string, string-length($string)) = '3' or
		substring($string, string-length($string)) = '4' or
		substring($string, string-length($string)) = '5' or
		substring($string, string-length($string)) = '6' or
		substring($string, string-length($string)) = '7' or
		substring($string, string-length($string)) = '8' or
		substring($string, string-length($string)) = '9'">
        <xsl:call-template name="chompPrefix">
          <xsl:with-param name="string">
            <xsl:value-of select="substring($string, 0, string-length($string) - 1)"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="chompWholeWords">
    <xsl:param name="string"/>
    <xsl:param name="prefix"/>
    <xsl:param name="firstvalue"/>
    <xsl:param name="lastvalue"/>


    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')"/>
    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="nextvalue" select="substring-after($nextvariant, $nextprefix)"/>

    <xsl:choose>
      <xsl:when test="$string = '' ">
        <!-- tidy up -->
        <xsl:value-of select="$lastvalue"/>
      </xsl:when>

      <xsl:when test="$nextvariant = ''">
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="$lastvalue"/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$nextvalue != ''">
        <!-- tidy up -->
        <xsl:value-of select="$lastvalue"/>
      </xsl:when>
      <xsl:when test="$lastvalue = ''">
        <!-- no name for appli, keep going but do not write -->
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="$nextvariant"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$lastvalue"/>
        <xsl:text>, </xsl:text>
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="$nextvariant"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>


  <xsl:template name="chompVariantBlock">
    <xsl:param name="string"/>
    <xsl:param name="prefix"/>
    <xsl:param name="firstvalue"/>
    <xsl:param name="lastvalue"/>

    <xsl:variable name="nextwantedvalue" select="$lastvalue + 1"/>
    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')"/>

    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="nextvalue">
      <xsl:choose>
        <xsl:when test="$prefix = 'NO PREFIX'">
          <xsl:value-of select="$nextvariant"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="number(substring-after($nextvariant, $prefix))"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$string = '' ">
        <!-- tidy up -->
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue"/>
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:when test="$nextvariant = ''">
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="$lastvalue"/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$nextvariant = $nextprefix">
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue"/>
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$nextprefix != $prefix">
        <!-- tidy up -->
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue"/>
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$nextvalue != $nextwantedvalue">
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue"/>
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:text>,</xsl:text>
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$nextvalue"/>
          <xsl:with-param name="lastvalue" select="$nextvalue"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
          <xsl:with-param name="prefix" select="$prefix"/>
          <xsl:with-param name="firstvalue" select="$firstvalue"/>
          <xsl:with-param name="lastvalue" select="$nextvalue"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <xsl:template name="returnVariantBlock">
    <xsl:param name="string"/>
    <xsl:param name="prefix"/>
    <xsl:param name="mode"/>

    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')"/>
    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$mode = 'pennant'">
        <xsl:choose>
          <xsl:when test="$string = ''"/>
          <xsl:when test="$nextvariant = ''">
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
              <xsl:with-param name="prefix" select="$prefix"/>
              <xsl:with-param name="mode" select="'pennant'"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$nextprefix != $prefix">
            <xsl:value-of select="$string"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
              <xsl:with-param name="prefix" select="$prefix"/>
              <xsl:with-param name="mode" select="'pennant'"/>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$mode = 'words'">
        <xsl:choose>
          <xsl:when test="$string = ''"/>
          <xsl:when test="$nextvariant = ''">
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
              <xsl:with-param name="prefix" select="$prefix"/>
              <xsl:with-param name="mode" select="'words'"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$nextprefix != $nextvariant">
            <xsl:value-of select="$string"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))"/>
              <xsl:with-param name="prefix" select="$prefix"/>
              <xsl:with-param name="mode" select="'words'"/>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  
  <xsl:function name="str:attributiseString">
    <xsl:param name="string"/>
    <xsl:variable name="transstring">
      <xsl:for-each select="string-to-codepoints($string)">
        <xsl:choose>
          <xsl:when test="(current() &gt;= 34 and current() &lt;= 38) or (current() &gt;= 40 and current() &lt;= 95) or (current() &gt;= 97 and current() &lt;= 255)">
            <xsl:value-of select="codepoints-to-string(current())"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:choose>
              <xsl:when test="$translations/root/item[@number = current()]">
                <!--            <xsl:message><xsl:value-of select="."/> Does match!! <xsl:value-of select="$translations/root/item[@number = current()]"/></xsl:message> -->
                <xsl:value-of select="$translations/root/item[@number = current()]"/>
              </xsl:when>
              <xsl:otherwise>
                <!--            <xsl:message><xsl:value-of select="current()"/> does not match!! <xsl:value-of select="codepoints-to-string(current())"/></xsl:message> -->
                <xsl:value-of select="''"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:variable>



    <xsl:value-of select="$transstring"/>

  </xsl:function>

  <xsl:function name="str:getImagePrefix" as="xs:string">
    <xsl:param name="string"/>

    <xsl:choose>

      <xsl:when test="$imagetypes/root/item[@name = $string]">
        <xsl:value-of select="$imagetypes/root/item[@name = $string][1]"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:message>
          Cannot find prefix for -<xsl:value-of select="$string"/>-
        </xsl:message>
        <xsl:text>p</xsl:text>
      </xsl:otherwise>

    </xsl:choose>


  </xsl:function>


  <xsl:param name="displayUnknowns" select="0"/>


  <xsl:variable name="indexstyle">
    <xsl:value-of select="'bu.notag.title|bu.notag.title|othertitle'"/>
  </xsl:variable>

  <xsl:variable name="sectonestyle" select="substring-before($indexstyle, '|')"/>
  <xsl:variable name="secttwostyle" select="substring-before(substring-after($indexstyle, '|'), '|')"/>
  <xsl:variable name="sectthreestyle" select="substring-after(substring-after($indexstyle, '|'), '|')"/>


  <!-- HTML/BODY/SECTIONHEAD -->

  <xsl:template name="section.header">


    <xsl:choose>
      <xsl:when test="matches($section, '[A-Za-z0-9]')">
        <xsl:value-of select="$section"/>
      </xsl:when>
      <xsl:when test="(j:record/j:metadata/jm:classification[@taxonomy='productBrowseTree']/jm:standardName)[1]">
        <xsl:value-of select='(j:record/j:metadata/jm:classification[@taxonomy="productBrowseTree"]/jm:standardName)[1]'/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select='(j:record/j:metadata/jm:classification[@taxonomy="Product Browse Tree"]/jm:standardName)[1]'/>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:choose>

      <xsl:when test="j:record/j:metadata/jm:country[jm:context/jm:standardName = 'eDocHeader']">
        <xsl:text>, </xsl:text>




        <xsl:value-of select='normalize-space(j:record/j:metadata/jm:country[jm:context/jm:standardName = "eDocHeader"][1]/jm:standardName)'/>


      </xsl:when>

      <xsl:when test="j:record/j:metadata/jm:country[jm:context/jm:standardName = 'eIndex']">
        <xsl:text>, </xsl:text>




        <xsl:value-of select='normalize-space(j:record/j:metadata/jm:country[jm:context/jm:standardName = "eIndex"][1]/jm:standardName)'/>


      </xsl:when>

      <xsl:when test="j:record/j:metadata/jm:country[jm:standardName != '']">
        <xsl:text>, </xsl:text>




        <xsl:value-of select='normalize-space(j:record/j:metadata/jm:country[jm:standardName != ""][1]/jm:standardName)'/>


      </xsl:when>

      <xsl:when test='j:record/j:metadata/dc:subject[@qualifier="country"] !=""'>
        <xsl:text>, </xsl:text>




        <xsl:value-of select='normalize-space((j:record/j:metadata/dc:subject[@qualifier="country"])[1])'/>


      </xsl:when>
      <xsl:when test='j:record/j:metadata/dc:subject[@qualifier="countryOfOrigin"] !=""'>
        <xsl:text>, </xsl:text>




        <xsl:value-of select='normalize-space((j:record/j:metadata/dc:subject[@qualifier="countryOfOrigin"])[1])'/>


      </xsl:when>
      <xsl:otherwise>


      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <!-- HTML/BODY/SECTIONHEAD/H2 -->

  <xsl:template name="H2">
    <xsl:choose>
      <xsl:when test='j:record/j:title[1]/j:organisation'>

        <table width="100%">
          <tr>
            <td align="center">
              <h2 align="center">
                <b>
                  <xsl:value-of select='(j:record/j:title/j:organisation)[1]'/>
                  <xsl:if test='(/j:record/j:shortTitle/j:organisation)[1]'>
                    <xsl:text> - </xsl:text>
                    <xsl:for-each select='/j:record/j:shortTitle/j:organisation'>
                      <xsl:apply-templates/>
                      <xsl:text>&#160;</xsl:text>
                    </xsl:for-each>
                  </xsl:if>
                </b>

              </h2>
            </td>
          </tr>
        </table>


        <xsl:if test="/j:record/j:shortTitle[not(@delivery=('print','none'))][not(j:organisation)]">

          <h3 align="center">
            <xsl:apply-templates select='j:record/j:shortTitle' mode="titlemode"/>
          </h3>


        </xsl:if>

        <xsl:if test="(/j:record/j:title[not(@delivery=('print','none'))])[2] and not(/j:record/shortTitle[not(@delivery=('print','none'))][not(j:organisation)])">

          <h3 align="center">
            <xsl:value-of select='(j:record/j:title)[2]'/>
          </h3>


        </xsl:if>

        <xsl:if test="/j:record//j:sect1/j:para[@qualifier = 'division']">

          <h3 align="center">
            <xsl:apply-templates select='j:record//j:sect1/j:para[@qualifier = "division"]/j:label[@qualifier = "Name"]' mode="titlemode"/>
            <xsl:if test="/j:record//j:sect1/j:para[@qualifier = 'division']/j:label[@qualifier = 'Abbr']">
              <xsl:text> - </xsl:text>
              <xsl:apply-templates select='j:record//j:sect1/j:para[@qualifier = "division"]/j:label[@qualifier = "Abbr"]' mode="titlemode"/>
            </xsl:if>
          </h3>


        </xsl:if>

        <!--
 				<xsl:if test="/j:record//j:sect1/j:para[@qualifier = 'subs of']">
 										
 					<xsl:for-each select="/j:record//j:sect1/j:para[@qualifier = 'subs of']">
 						<b><xsl:value-of select="."/></b><br/> 		
 					</xsl:for-each>
 					<br/>				
 					
 					 
 					
 				</xsl:if>
 				-->

      </xsl:when>
      <xsl:otherwise>
        <table width="100%">
          <xsl:choose>
            <xsl:when test='j:record[@qualifier="territory"]'>

              <tr>
                <td align="center">
                  <h2 size="22pt">
                    <b>TERRITORIES</b>
                  </h2>
                </td>
              </tr>

            </xsl:when>
            <xsl:otherwise>


              <tr>
                <td align="center">
                  <h2 style="font-size:22pt">
                    <b>
                      <xsl:apply-templates select='(/j:record/j:title)[1]' mode='normal'/>
                    </b>
                  </h2>
                </td>
              </tr>

            </xsl:otherwise>
          </xsl:choose>

        </table>

        <p>
          <b>
            <xsl:text>Date Posted:&#160;</xsl:text>
          </b>
          <xsl:value-of select="concat($postday, '-', $postmonth, '-', $postyear)"/>
        </p>
        <xsl:if test="janes:record//janes:authorName">
          <p>
            <b>
              <xsl:text>Author:&#160;</xsl:text>
            </b>
            <xsl:apply-templates select="janes:record/janes:authoredBy"/>
          </p>
        </xsl:if>
        <p>
          <b>
            <xsl:text>Publication:&#160;</xsl:text>
          </b>
          <xsl:value-of select="$publication"/>
        </p>
          
        <xsl:for-each select='/j:record/j:shortTitle'>
          <h3 align="center" style="text-align:center">
            <xsl:apply-templates/>
          </h3>
        </xsl:for-each>
        
        <xsl:apply-templates select="janes:record/janes:sect1[@qualifier = 'event']"/>

        <xsl:apply-templates select="janes:record/janes:sect1[@qualifier = 'keyPoints']"/>

      </xsl:otherwise>
    </xsl:choose>

    <xsl:choose>
      <xsl:when test="count(//janes:shipTotal[*[. != '']]) &gt; 1">
        <xsl:for-each select="//janes:shipTotal[*[. != '']]">
          <b>
            <xsl:value-of select="janes:className"/>
          </b>
          <br />
          <xsl:variable name="shipId" select="janes:className/@xref"></xsl:variable>
          <xsl:call-template name="genJFSShipCount">
            <xsl:with-param name="countType">IN SERVICE</xsl:with-param>
            <xsl:with-param name="countTypeMeta">active</xsl:with-param>
            <xsl:with-param name="countTypeEnhanced">inService</xsl:with-param>
            <xsl:with-param name="id" select="$shipId"></xsl:with-param>
          </xsl:call-template>
          <xsl:call-template name="genJFSShipCount">
            <xsl:with-param name="countType">BUILDING</xsl:with-param>
            <xsl:with-param name="countTypeMeta">building</xsl:with-param>
            <xsl:with-param name="countTypeEnhanced">building</xsl:with-param>
            <xsl:with-param name="id" select="$shipId"></xsl:with-param>
          </xsl:call-template>
          <xsl:call-template name="genJFSShipCount">
            <xsl:with-param name="countType">RESERVE</xsl:with-param>
            <xsl:with-param name="countTypeMeta">reserved</xsl:with-param>
            <xsl:with-param name="countTypeEnhanced">reserved</xsl:with-param>
            <xsl:with-param name="id" select="$shipId"></xsl:with-param>
          </xsl:call-template>
          <xsl:call-template name="genJFSShipCount">
            <xsl:with-param name="countType">PROPOSED/TRANSFER</xsl:with-param>
            <xsl:with-param name="countTypeMeta">proposed</xsl:with-param>
            <xsl:with-param name="countTypeEnhanced">proposed</xsl:with-param>
            <xsl:with-param name="id" select="$shipId"></xsl:with-param>
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="genJFSShipCount">
          <xsl:with-param name="countType">IN SERVICE</xsl:with-param>
          <xsl:with-param name="countTypeMeta">active</xsl:with-param>
          <xsl:with-param name="countTypeEnhanced">inService</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="genJFSShipCount">
          <xsl:with-param name="countType">BUILDING</xsl:with-param>
          <xsl:with-param name="countTypeMeta">building</xsl:with-param>
          <xsl:with-param name="countTypeEnhanced">building</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="genJFSShipCount">
          <xsl:with-param name="countType">RESERVE</xsl:with-param>
          <xsl:with-param name="countTypeMeta">reserved</xsl:with-param>
          <xsl:with-param name="countTypeEnhanced">reserved</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="genJFSShipCount">
          <xsl:with-param name="countType">PROPOSED/TRANSFER</xsl:with-param>
          <xsl:with-param name="countTypeMeta">proposed</xsl:with-param>
          <xsl:with-param name="countTypeEnhanced">proposed</xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
      </xsl:choose>



  </xsl:template>


  <!-- JFS New style (Not required - dc:subject now fulfilled by to_output -->
  <!--
 <xsl:template name='genJFSShipCount'>
 	<xsl:param name="countType"/>
 	<xsl:param name="countTypeMeta"/>
 
 	<xsl:choose>
 		<xsl:when test='matches(j:record//j:fleetList//j:shipTotal//*[@label = $countTypeMeta], "[0-9]")'>
 			<xsl:for-each select="j:record//j:fleetList//j:shipTotal//*[@label = $countTypeMeta]">
 				<xsl:message>NValue of <xsl:value-of select="$countTypeMeta"/> is <xsl:value-of select="."/></xsl:message>
 			</xsl:for-each>
 
 			<xsl:comment><xsl:text>&#160;</xsl:text><xsl:value-of select='$countType'/><xsl:text>&#160;</xsl:text></xsl:comment>
 			<i>
 				<xsl:value-of select='$countType'/>
 				<xsl:text>: </xsl:text>
 				<xsl:value-of select='sum(xs:integer(j:record//j:fleetList//j:shipTotal//*[@label = $countTypeMeta]))'/>
 			</i>
 			<br/>
 			<xsl:comment><xsl:text> /</xsl:text><xsl:value-of select='$countType'/><xsl:text>&#160;</xsl:text></xsl:comment>
 		</xsl:when>		
 		<xsl:when test='matches(j:record/j:metadata/dc:subject[@qualifier = $countTypeMeta][1], "[0-9]")'>
 			<xsl:comment><xsl:text>&#160;</xsl:text><xsl:value-of select='$countType'/><xsl:text>&#160;</xsl:text></xsl:comment>
 			<b>
 				<xsl:value-of select='$countType'/>
 				<xsl:text>: </xsl:text>
 				<xsl:value-of select='/j:record/j:metadata/dc:subject[@qualifier=$countTypeMeta][1]'/>
 			</b>
 			<br/>
 			<xsl:comment><xsl:text> /</xsl:text><xsl:value-of select='$countType'/><xsl:text>&#160;</xsl:text></xsl:comment>
 		</xsl:when>
 		
 		<xsl:otherwise/>
 		
 	</xsl:choose>		
 
 </xsl:template>
 -->

  <!-- JFS -->
  <xsl:template name="genJFSShipCount">
    <xsl:param name="countType"/>
    <xsl:param name="countTypeMeta"/>
    <xsl:param name="countTypeEnhanced"/>
    <xsl:param name="id"/>

    <xsl:variable name="elementlocalname" select="concat($countTypeMeta, 'No')"/>

    <xsl:choose>
      <xsl:when test="$id != ''">

	<xsl:if test="//janes:shipTotal[janes:className/@xref = $id]/*[local-name() = $elementlocalname][text() != &#34;&#34;]">
          <b>
            <xsl:text>&#160;&#160;</xsl:text>
            <xsl:value-of select="$countType"/>
            <xsl:text>: </xsl:text>
            <xsl:value-of select="//janes:shipTotal[janes:className/@xref = $id]/*[local-name() = $elementlocalname]"/>
          </b>
          <br/>
        </xsl:if>

      </xsl:when>      
        
      <xsl:when test="//janes:shipTotal/*[local-name() = $elementlocalname][text() != &#34;&#34;]">
  
        <b>
          <xsl:value-of select="$countType"/>
          <xsl:text>: </xsl:text>
          <xsl:value-of select="//janes:shipTotal/*[local-name() = $elementlocalname][text() != &#34;&#34;][1]"/>
        </b>
        <br/>
      </xsl:when>

      <xsl:when test="/janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1] and janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1] != &#34;&#34;">
        <b>
          <xsl:value-of select="$countType"/>
          <xsl:text>: </xsl:text>
          <xsl:value-of select="/janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1]"/>
        </b>
        <br/>
      </xsl:when>

      <xsl:when test="//jm:inventory/*[local-name() = $countTypeEnhanced][. != &#34;&#34;]">
        <b>
          <xsl:value-of select="$countType"/>
          <xsl:text>: </xsl:text>
          <xsl:value-of select="//jm:inventory/*[local-name() = $countTypeEnhanced][. != &#34;&#34;][1]"/>
        </b>
        <br/>
      </xsl:when>

      <xsl:otherwise/>

    </xsl:choose>

  </xsl:template>
  <!-- /JFS -->

  <!-- HTML/BODY/TITLE -->

  <xsl:template match='j:sect1/j:title'>

    <xsl:choose>

      <xsl:when test='parent::j:sect1[@qualifier = ("box", "event", "keyPoints", "breakout")]'>

        <b>
          <xsl:apply-templates/>
        </b>

      </xsl:when>

      <xsl:when test="$sectonestyle = 'bu.notag.title'">
        <xsl:call-template name="bu.notag.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectonestyle = 'bu.title'">
        <xsl:call-template name="bu.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectonestyle = 'bu.h3.title'">
        <xsl:call-template name="bu.h3.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectonestyle = 'othertitle'">
        <xsl:call-template name="other.title">
          <xsl:with-param name="othertitle" select="."/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>

  </xsl:template>

  <xsl:template match='j:sect2/j:title'>

    <xsl:choose>
      <xsl:when test="$secttwostyle = 'bu.notag.title'">
        <xsl:call-template name="bu.notag.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$secttwostyle = 'bu.title'">
        <xsl:call-template name="bu.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$secttwostyle = 'bu.h3.title'">
        <xsl:call-template name="bu.h3.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$secttwostyle = 'othertitle'">
        <xsl:call-template name="other.title">
          <xsl:with-param name="othertitle" select="."/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>


  </xsl:template>

  <xsl:template match='j:sect3/j:title'>
    <xsl:choose>
      <xsl:when test='ancestor::j:sect2[@qualifier="box"]'>
        <b>
          <xsl:apply-templates/>
        </b>
        <br/>
      </xsl:when>

      <xsl:when test="$sectthreestyle = 'bu.notag.title'">
        <xsl:call-template name="bu.notag.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectthreestyle = 'bu.title'">
        <xsl:call-template name="bu.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectthreestyle = 'bu.h3.title'">
        <xsl:call-template name="bu.h3.title">
          <xsl:with-param name="butitle" select="."/>
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$sectthreestyle = 'othertitle'">
        <xsl:call-template name="other.title">
          <xsl:with-param name="othertitle" select="."/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='j:sect1/j:shortTitle | j:sect2/j:shortTitle | j:sect3/j:shortTitle | j:sect4/j:title | j:sect4/j:shortTitle | j:sect5/j:title | j:sect5/j:shortTitle | j:sectN/j:title | j:sectN/j:shortTitle'>
    <xsl:call-template name="other.title">
      <xsl:with-param name="othertitle" select="."/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="j:table/j:shortTitle">
    <b>
      <i>
        <xsl:apply-templates/>
      </i>
    </b>
    <br/>
  </xsl:template>

  <xsl:template match="j:record/j:shortTitle" mode="titlemode">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="j:equipment">
    <xsl:apply-templates/>
  </xsl:template>



  <xsl:template name="OrgDivision">
    <xsl:if test=".//j:para[@qualifier='division']">
      <center>
        <b>
          <xsl:value-of select=".//j:para[@qualifier='division']"/>
        </b>
      </center>
      <br/>
      <!-- added center for corrections -->
    </xsl:if>
  </xsl:template>

  <xsl:template match="j:para[@qualifier='division']" />

  <xsl:template name="subsOf">
    <xsl:if test=".//j:para[@qualifier='subs of']">
      <xsl:for-each select=".//j:para[@qualifier='subs of']">
        <p>
          <b>
            <xsl:value-of select="."/>
          </b>
        </p>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>


  <xsl:template match="j:para[@qualifier='subs of']" />




  <xsl:template match="j:para[@qualifier='airport identifier']">

    <b>
      <xsl:text>Airport Identifier: </xsl:text>
    </b>

    <xsl:value-of select="j:label[@qualifier='Name']"/>
    <xsl:if test="j:label[@qualifier='Abbr'] !=''">
      <xsl:text> (</xsl:text>
      <xsl:value-of select="j:label[@qualifier='Abbr']" />
      <xsl:text>)</xsl:text>
    </xsl:if>

    <br/>
  </xsl:template>

  <xsl:template match="j:para[@qualifier='airline identifier']">

    <b>
      <xsl:text>Airline Identifier: </xsl:text>
    </b>

    <xsl:value-of select="j:label[@qualifier='Name']"/>
    <xsl:if test="j:label[@qualifier='Abbr'] !=''">
      <xsl:text> (</xsl:text>
      <xsl:value-of select="j:label[@qualifier='Abbr']" />
      <xsl:text>)</xsl:text>
    </xsl:if>
    <br/>
  </xsl:template>

  <!-- ******************************************************************************************* -->
  <xsl:template match="j:address[@qualifier='mail']">
    <p>
      <xsl:choose>
        <xsl:when test="ancestor::j:sect1/j:address[@qualifier='location']">
          <b>Mailing Address</b>
        </xsl:when>
        <xsl:otherwise>
          <b>Address</b>
        </xsl:otherwise>
      </xsl:choose>
    </p>

    <xsl:if test="./j:para[1][not(boolean(@qualifier))]">
      <p>
        <xsl:value-of select="./j:para[1]" />
      </p>
    </xsl:if>
    <xsl:if test="./j:para[2][not(boolean(@qualifier))]">
      <p>
        <xsl:value-of select="./j:para[2]" />
      </p>
    </xsl:if>
    <xsl:if test="./j:para[3][not(boolean(@qualifier))]">
      <p>
        <xsl:value-of select="./j:para[3]" />
      </p>
    </xsl:if>

    <xsl:variable name="pobox" select="./j:para[@qualifier='POBox']" />
    <xsl:variable name="postocde"	select="./j:para[@qualifier='postcode']"/>
    <xsl:variable name="city"	select="./j:para[@qualifier='city']"/>
    <xsl:variable name="district" select="./j:para[@qualifier='district']"/>
    <xsl:variable name="county" select="./j:para[@qualifier='county']"/>
    <xsl:variable name="country"	select="./j:para[@qualifier='country']"/>

    <xsl:choose>
      <xsl:when test="j:para[@qualifier='postcode']/following-sibling::j:para[@qualifier='city']">

        <xsl:if test="string($pobox)">
          <p>
            <xsl:value-of select="$pobox" />
          </p>
        </xsl:if>
        <xsl:if test="string($postocde)">
          <p>
            <xsl:value-of select="$postocde" />
          </p>
        </xsl:if>
        <xsl:if test="string($city)">
          <p>
            <xsl:value-of select="$city"/>
          </p>
        </xsl:if>
        <xsl:if test="string($district)">
          <p>
            <xsl:value-of select="$district"/>
          </p>
        </xsl:if>
        <xsl:if test="string($county)">
          <p>
            <xsl:value-of select="$county"/>
          </p>
        </xsl:if>
        <xsl:if test="string($country)">
          <p>
            <xsl:value-of select="$country"/>
          </p>
        </xsl:if>
      </xsl:when>

      <xsl:when test="j:para[@qualifier='postcode']/following-sibling::j:para[@qualifier='district']">

        <xsl:if test="string($pobox)">
          <p>
            <xsl:value-of select="$pobox" />
          </p>
        </xsl:if>
        <xsl:if test="string($postocde)">
          <p>
            <xsl:value-of select="$postocde" />
          </p>
        </xsl:if>
        <xsl:if test="string($city)">
          <p>
            <xsl:value-of select="$city"/>
          </p>
        </xsl:if>
        <xsl:if test="string($district)">
          <p>
            <xsl:value-of select="$district"/>
          </p>
        </xsl:if>
        <xsl:if test="string($county)">
          <p>
            <xsl:value-of select="$county"/>
          </p>
        </xsl:if>
        <xsl:if test="string($country)">
          <p>
            <xsl:value-of select="$country"/>
          </p>
        </xsl:if>
      </xsl:when>

      <xsl:when test="j:para[@qualifier='postcode']/preceding-sibling::j:para[1][@qualifier='county']">

        <xsl:if test="string($pobox)">
          <p>
            <xsl:value-of select="$pobox" />
          </p>
        </xsl:if>
        <xsl:if test="string($city)">
          <p>
            <xsl:value-of select="$city"/>
          </p>
        </xsl:if>
        <xsl:if test="string($district)">
          <p>
            <xsl:value-of select="$district"/>
          </p>
        </xsl:if>
        <xsl:if test="string($county)">
          <p>
            <xsl:value-of select="$county"/>
          </p>
        </xsl:if>
        <xsl:if test="string($postocde)">
          <p>
            <xsl:value-of select="$postocde"/>
          </p>
        </xsl:if>
        <xsl:if test="string($country)">
          <p>
            <xsl:value-of select="$country"/>
          </p>
        </xsl:if>
      </xsl:when>

      <xsl:when test="j:para[@qualifier='country']/preceding-sibling::j:para[not(@qualifier)]">

        <xsl:if test="string($pobox)">
          <p>
            <xsl:value-of select="$pobox" />
          </p>
        </xsl:if>
        <xsl:if test="string($postocde)">
          <p>
            <xsl:value-of select="$postocde" />
          </p>
        </xsl:if>
        <xsl:if test="string($city)">
          <p>
            <xsl:value-of select="$city"/>
          </p>
        </xsl:if>
        <xsl:if test="string($district)">
          <p>
            <xsl:value-of select="$district"/>
          </p>
        </xsl:if>
        <xsl:if test="string($county)">
          <p>
            <xsl:value-of select="$county"/>
          </p>
        </xsl:if>
        <xsl:if test="string($country)">
          <p>
            <xsl:value-of select="$country"/>
          </p>
        </xsl:if>
      </xsl:when>

      <xsl:otherwise>

        <xsl:if test="string($pobox)">
          <p>
            <xsl:value-of select="$pobox" />
          </p>
        </xsl:if>
        <xsl:if test="string($postocde)">
          <p>
            <xsl:value-of select="$postocde" />
          </p>
        </xsl:if>
        <xsl:if test="string($city)">
          <p>
            <xsl:value-of select="$city"/>
          </p>
        </xsl:if>
        <xsl:if test="string($district)">
          <p>
            <xsl:value-of select="$district"/>
          </p>
        </xsl:if>
        <xsl:if test="string($county)">
          <p>
            <xsl:value-of select="$county"/>
          </p>
        </xsl:if>
        <xsl:if test="string($country)">
          <p>
            <xsl:value-of select="$country"/>
          </p>
        </xsl:if>

      </xsl:otherwise>
    </xsl:choose>
    <p>
      <xsl:apply-templates select="j:dataGroup" />
    </p>


  </xsl:template>
  <!-- ********************************************* -->

  <xsl:template match="j:address[@qualifier='location']">
    <p>
      <b>Location Address</b>
    </p>
      <xsl:if test="./j:para[1][not(boolean(@qualifier))]">
        <p>
          <xsl:value-of select="./j:para[1]" />
        </p>
      </xsl:if>
      <xsl:if test="./j:para[2][not(boolean(@qualifier))]">
        <p>
          <xsl:value-of select="./j:para[2]" />
        </p>
      </xsl:if>
      <xsl:if test="./j:para[3][not(boolean(@qualifier))]">
        <p>
          <xsl:value-of select="./j:para[3]" />
        </p>
      </xsl:if>

      <!-- !! -->
      <xsl:variable name="pobox" select="./j:para[@qualifier='POBox']" />
      <!-- !! -->
      <xsl:variable name="postocde"	select="./j:para[@qualifier='postcode']"/>
      <!-- !! -->
      <xsl:variable name="city"	select="./j:para[@qualifier='city']"/>
      <!-- !! -->
      <xsl:variable name="district" select="./j:para[@qualifier='district']"/>
      <!-- !! -->
      <xsl:variable name="county" select="./j:para[@qualifier='county']"/>
      <!-- !! -->
      <xsl:variable name="country"	select="./j:para[@qualifier='country']"/>

      <xsl:choose>
        <xsl:when test="j:para[@qualifier='postcode']/following-sibling::j:para[@qualifier='city']">

          <xsl:if test="string($pobox)">
            <p>
              <xsl:value-of select="$pobox" />
            </p>
          </xsl:if>
          <xsl:if test="string($postocde)">
            <p>
              <xsl:value-of select="$postocde" />
            </p>
          </xsl:if>
          <xsl:if test="string($city)">
            <p>
              <xsl:value-of select="$city"/>
            </p>
          </xsl:if>
          <xsl:if test="string($district)">
            <p>
              <xsl:value-of select="$district"/>
            </p>
          </xsl:if>
          <xsl:if test="string($county)">
            <p>
              <xsl:value-of select="$county"/>
            </p>
          </xsl:if>
          <xsl:if test="string($country)">
            <p>
              <xsl:value-of select="$country"/>
            </p>
          </xsl:if>
        </xsl:when>

        <xsl:when test="j:para[@qualifier='postcode']/following-sibling::j:para[@qualifier='district']">

          <xsl:if test="string($pobox)">
            <p>
              <xsl:value-of select="$pobox" />
            </p>
          </xsl:if>
          <xsl:if test="string($postocde)">
        <p>
            <xsl:value-of select="$postocde" />
        </p>
      </xsl:if>
          <xsl:if test="string($city)">
            <p>
              <xsl:value-of select="$city"/>
            </p>
          </xsl:if>
          <xsl:if test="string($district)">
            <p>
              <xsl:value-of select="$district"/>
            </p>
          </xsl:if>
          <xsl:if test="string($county)">
            <p>
              <xsl:value-of select="$county"/>
            </p>
          </xsl:if>
          <xsl:if test="string($country)">
            <p>
              <xsl:value-of select="$country"/>
            </p>
          </xsl:if>
        </xsl:when>

        <xsl:when test="j:para[@qualifier='postcode']/preceding-sibling::j:para[1][@qualifier='county']">

          <xsl:if test="string($pobox)">
            <p>
              <xsl:value-of select="$pobox" />
            </p>
          </xsl:if>
          <xsl:if test="string($city)">
        <p>
            <xsl:value-of select="$city"/>
        </p>
      </xsl:if>
          <xsl:if test="string($district)">
            <p>
              <xsl:value-of select="$district"/>
            </p>
          </xsl:if>
          <xsl:if test="string($county)">
            <p>
              <xsl:value-of select="$county"/>
            </p>
          </xsl:if>
          <xsl:choose>
            <xsl:when test="not(string($postocde))">
              <br/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$postocde"/>
              <br/>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:if test="string($country)">
            <p>
              <xsl:value-of select="$country"/>
            </p>
          </xsl:if>
        </xsl:when>


        <xsl:otherwise>

          <xsl:if test="string($pobox)">
            <p>
              <xsl:value-of select="$pobox" />
            </p>
          </xsl:if>
          <xsl:if test="string($postocde)">
            <p>
              <xsl:value-of select="$postocde" />
            </p>
          </xsl:if>
          <xsl:if test="string($city)">
            <p>
              <xsl:value-of select="$city"/>
            </p>
          </xsl:if>
          <xsl:if test="string($district)">
            <p>
              <xsl:value-of select="$district"/>
            </p>
          </xsl:if>
          <xsl:if test="string($county)">
            <p>
              <xsl:value-of select="$county"/>
            </p>
          </xsl:if>
          <xsl:if test="string($country)">
            <p>
              <xsl:value-of select="$country"/>
            </p>
          </xsl:if>

        </xsl:otherwise>
      </xsl:choose>
    <p>
      <xsl:apply-templates select="j:dataGroup" />
    </p>
  </xsl:template>


  <!-- ************************************ -->
  <xsl:template name="createNames_plural">
    <xsl:param name="my_name"/>
    <xsl:param name="my_name_value"/>
    <xsl:param name="my_name_Abbr"/>
    <xsl:variable name="previous_sib" select="preceding-sibling::j:para[1]/@qualifier" />
    <xsl:variable name="previous_sib_name" select="following-sibling::j:para[1]/j:label[@qualifier='Name']" />

    <xsl:variable name="lookupNames">
      <Altname name="compact name">Compact Names: </Altname>
      <Altname name="alternative name">Alternative Names: </Altname>
      <Altname name="previous name">Previous Names: </Altname>
      <Altname name="stock market name">Stock Market Names: </Altname>
      <Altname name="index name">Index Names: </Altname>
      <Altname name="local language name">Local Language Names: </Altname>
      <Altname name="trading name">Trading Names: </Altname>
    </xsl:variable>

    <b>
      <xsl:value-of select="$lookupNames/Altname[@name = $my_name]" />
    </b>
    <br/>
    <xsl:text>&#160;&#160;&#160;</xsl:text>
    <xsl:value-of select="$my_name_value"/>


    <xsl:choose>
      <xsl:when test="$my_name_Abbr !=''">
        <xsl:text> (</xsl:text>
        <xsl:value-of select="$my_name_Abbr"/>
        <xsl:text>)</xsl:text>
        <br/>
      </xsl:when>
      <xsl:otherwise>
        <br/>
      </xsl:otherwise>
    </xsl:choose>



  </xsl:template>

  <!-- ************************************ -->
  <xsl:template name="createNames">
    <xsl:param name="my_name"/>
    <xsl:param name="my_name_value"/>
    <xsl:param name="my_name_Abbr"/>
    <xsl:variable name="previous_sib" select="preceding-sibling::j:para[1]/@qualifier" />
    <xsl:variable name="previous_sib_name" select="following-sibling::j:para[1]/j:label[@qualifier='Name']" />






    <xsl:variable name="lookupNames">
      <Altname name="compact name">Compact Name: </Altname>
      <Altname name="alternative name">Alternative Name: </Altname>
      <Altname name="previous name">Previous Name: </Altname>
      <Altname name="stock market name">Stock Market Name: </Altname>
      <Altname name="index name">Index Name: </Altname>
      <Altname name="local language name">Local Language Name: </Altname>
      <Altname name="trading name">Trading Name: </Altname>
    </xsl:variable>




    <xsl:choose>
      <xsl:when test="$previous_sib = $my_name">


        <xsl:choose>
          <xsl:when test="$my_name = 'compact name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'alternative name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'previous name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'compact name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'stock market name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'index name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'local language name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>
          <xsl:when test="$my_name = 'trading name'">
            <xsl:text>&#160;&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value"/>
          </xsl:when>

          <xsl:otherwise/>

        </xsl:choose>






        <!-- 			<xsl:text>&#160;&#160;&#160;&#160;</xsl:text><xsl:value-of select="$my_name_value"/> -->
        <br/>
      </xsl:when>
      <xsl:otherwise>
        <b>
          <xsl:value-of select="$lookupNames/Altname[@name = $my_name]" />
        </b>
        <xsl:value-of select="$my_name_value"/>


        <xsl:choose>
          <xsl:when test="$my_name_Abbr !=''">
            <xsl:text> (</xsl:text>
            <xsl:value-of select="$my_name_Abbr"/>
            <xsl:text>)</xsl:text>
            <br/>
          </xsl:when>
          <xsl:otherwise>
            <br/>
          </xsl:otherwise>
        </xsl:choose>

      </xsl:otherwise>
    </xsl:choose>







  </xsl:template>


  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='compact name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='compact name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='compact name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='alternative name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='alternative name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='alternative name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='previous name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='previous name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='previous name')])">

        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='stock market name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='stock market name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='stock market name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='index name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='index name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='index name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='local language name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='local language name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='local language name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="j:para[@qualifier='trading name']">
    <xsl:choose>
      <xsl:when test="following-sibling::j:para[1][@qualifier ='trading name'] and (not(preceding-sibling::j:para[1]) or preceding-sibling::j:para[1][not(@qualifier ='trading name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier"/>
          <xsl:with-param name="my_name_value" select="./j:label[@qualifier='Name']"/>
          <xsl:with-param name="my_name_Abbr" select="./j:label[@qualifier='Abbr']"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->







  <!-- ****** ORGANISATION COMMUNICATION ******************************************************************************************************************************************************************************** -->


  <!-- ******************************************** -->

  <xsl:template match="j:para[@qualifier='Cable']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Sita']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='AFTN code']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>
  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Radio Code']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Teletext']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='e-mail']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->
  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Web']" priority="1">
    <xsl:call-template name="createWebCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>

    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='ftp']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='CompuServe']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Satcom']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Aircom']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>


  <!-- * Telex ******************************************* -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Telex']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************************************************************* -->


  <xsl:template name="createWebCode">
    <xsl:param name="my_qualifier"/>
    <xsl:variable name="lookup_2">
      <com_device_3 name="Web">Web: </com_device_3>
    </xsl:variable>

    <xsl:variable name="www" select="preceding-sibling::j:para[1]/@qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::j:para[1]/@qualifier" />


    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">
          <xsl:choose>
            <xsl:when test="$my_qualifier ='Web'">
              <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>

          <!--<a href="http://{./j:label[@qualifier='value']}" target="new">-->
          <a href="http://{./j:label[@qualifier='value']}">
            <xsl:value-of select="./j:label[@qualifier='value']"/>
          </a>
          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>

        </xsl:if>

        <xsl:if test="$previous_sib != $my_qualifier">

          <b>
            <xsl:value-of select="$lookup_2/com_device_3[@name = $my_qualifier]"/>
          </b>
          <!--<a href="http://{./j:label[@qualifier='value']}" target="new">-->
          <a href="http://{./j:label[@qualifier='value']}">
            <xsl:value-of select="./j:label[@qualifier='value']"/>
          </a>

          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>


  <!-- ******************************************************************************************* -->


  <xsl:template name="createKPWebCode">
    <xsl:param name="my_qualifier"/>
    <xsl:variable name="lookup_2">
      <com_device_3 name="Web">Web: </com_device_3>
    </xsl:variable>

    <xsl:variable name="www" select="preceding-sibling::j:para[1]/@qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::j:para[1]/@qualifier" />


    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">


          <xsl:choose>
            <xsl:when test="$my_qualifier ='Web'">
              <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>

          <!--<a href="http://{./j:label[@qualifier='value']}" target="new">-->
          <a href="http://{./j:label[@qualifier='value']}">
            <xsl:value-of select="./j:label[@qualifier='value']"/>
          </a>
          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
              F
            </xsl:otherwise>
          </xsl:choose>

        </xsl:if>

        <xsl:if test="$previous_sib != $my_qualifier">

          <b>
            <xsl:value-of select="$lookup_2/com_device_3[@name = $my_qualifier]"/>
          </b>
          <!--<a href="http://{./j:label[@qualifier='value']}" target="new">-->
          <a href="http://{./j:label[@qualifier='value']}">
            <xsl:value-of select="./j:label[@qualifier='value']"/>
          </a>

          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
              R
            </xsl:otherwise>
          </xsl:choose>

        </xsl:if>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>



  <!-- ******************************************************************************************* -->
  <xsl:template name="createOrgCode">
    <xsl:param name="my_qualifier"/>

    <xsl:variable name="lookup_1">
      <com_device_1 name="Telex">Telex: </com_device_1>
      <com_device_1 name="AFTN code">ATFN: </com_device_1>
      <com_device_1 name="e-mail">e-mail: </com_device_1>
      <com_device_1 name="Sita">Sita: </com_device_1>
      <com_device_1 name="Radio Code">Radio Code: </com_device_1>
      <com_device_1 name="ftp">ftp: </com_device_1>
      <com_device_1 name="CompuServe">CompuServe: </com_device_1>
      <com_device_1 name="Satcom">Satcom: </com_device_1>
      <com_device_1 name="Aircom">Aircom: </com_device_1>
      <com_device_1 name="Teletext">Teletext: </com_device_1>
      <com_device_1 name="Cable">Cable: </com_device_1>
    </xsl:variable>

    <xsl:variable name="previous_sib" select="preceding-sibling::j:para[1]/@qualifier" />
    <p>
    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">
          <xsl:value-of select="./j:label[@qualifier='value']"/>
          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>

        <xsl:if test="$previous_sib != $my_qualifier">
          <b>
            <xsl:value-of select="$lookup_1/com_device_1[@name = $my_qualifier]"/>
          </b>
          <xsl:value-of select="./j:label[@qualifier='value']"/>
          <xsl:choose>
            <xsl:when test=".//j:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./j:label[@qualifier='qualification']"/>
              <xsl:text>)</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
    </p>
  </xsl:template>


  <!-- ******************************************************************************************* -->



  <!-- * Telephone ******************************************* -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Telephone']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- * Fax ******************************************* -->
  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Fax']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- * Mobile ******************************************* -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Mobile']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>

  <!-- * Freephone ******************************************* -->

  <xsl:template match="j:dataGroup[@qualifier='orgCom']/j:para[@qualifier='Freephone']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier"/>
    </xsl:call-template>
  </xsl:template>





  <!-- ******************************************** -->
  <xsl:template name="createTelephone">
    <xsl:param name="my_qualifier"/>
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <p>
    <xsl:choose>
      <xsl:when test="$previous_sib = $my_qualifier">
        <xsl:choose>
          <xsl:when test="$my_qualifier ='Telephone'">
            <xsl:text>(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Fax'">
            <xsl:text>(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Freephone'">
            <xsl:text>(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Telex'">
            <xsl:text>(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Mobile'">
            <xsl:text>(+</xsl:text>
          </xsl:when>
          <xsl:otherwise>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:value-of select="./janes:label[@qualifier='intlCode']"/>
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='areaCode']"/>
        <xsl:text>) </xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='value']"/>
        <xsl:value-of select="$n"/>
        <xsl:choose>
          <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
            <xsl:text>(</xsl:text>
            <xsl:value-of select="./janes:label[@qualifier='qualification']"/>
            <xsl:text>)</xsl:text>
            <xsl:value-of select="$n"/>
          </xsl:when>
          <xsl:otherwise>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <b>
          <xsl:call-template name="lookup">
            <xsl:with-param name="lookup" select="$my_qualifier"/>
          </xsl:call-template>
        </b>
        <xsl:text>(+</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='intlCode']"/>
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='areaCode']"/>
        <xsl:text>) </xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='value']"/>
        <xsl:value-of select="$n"/>
        <xsl:choose>
          <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
            <xsl:text>(</xsl:text>
            <xsl:value-of select="./janes:label[@qualifier='qualification']"/>
            <xsl:text>)</xsl:text>
            <xsl:value-of select="$n"/>
          </xsl:when>
          <xsl:otherwise>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
    </p>
  </xsl:template>

  <xsl:template name="lookup">
    <xsl:param name="lookup"/>
    <xsl:choose>
      <xsl:when test="$lookup = 'Fax'">
        <xsl:text>Fax: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Freephone'">
        <xsl:text>Freephone: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Mobile'">
        <xsl:text>Mobile: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Telephone'">
        <xsl:text>Tel: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Telex'">
        <xsl:text>Telex: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Web'">
        <xsl:text>Web: </xsl:text>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>  
  


  <!-- ********* ORG FINANCE ***************************************************************************************************************************************************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgFinance']">

    <xsl:if test="preceding-sibling::j:dataGroup[1][@qualifier='orgCom']">
      <p/>
    </xsl:if>









    <xsl:for-each select="j:para[1]">
      <b>
        <xsl:value-of select="@qualifier" />
        <xsl:text>: </xsl:text>
      </b>
      <xsl:value-of select="./j:label[@qualifier='localCurrency']" />
      <xsl:value-of select=".//j:label[@qualifier='localValue']" />
      <xsl:text>&#160;</xsl:text>

      <xsl:variable name="toDate" select="substring(.//j:label[@qualifier='toDate'],8,4)" />
      <xsl:variable name="fromSDate" select="substring(.//j:label[@qualifier='fromDate'],8,4)" />

      <xsl:choose>
        <xsl:when test="$fromSDate = $toDate">

          <xsl:text>(</xsl:text>
          <xsl:value-of select="$fromSDate" />
          <xsl:text>) </xsl:text>
        </xsl:when>
        <xsl:otherwise>

          <xsl:text>(</xsl:text>
          <xsl:value-of select="$fromSDate" />
          <xsl:text>/</xsl:text>
          <xsl:value-of select="substring($toDate,3,2)" />
          <xsl:text>)</xsl:text>

        </xsl:otherwise>
      </xsl:choose>


      <xsl:if test=".//j:label[@qualifier='qualification'] !=''">
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select=".//j:label[@qualifier='qualification']" />
      </xsl:if>
      <br/>
    </xsl:for-each>



  </xsl:template>

  <!-- *********** ORG STATS *************************************************************************************************************************************************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='orgStat']">






    <xsl:for-each select="j:para[1]">

      <br/>
      <!-- added this break for corrections -->
      <b>
        <xsl:value-of select="@qualifier" />:
      </b>
      <xsl:value-of select="./j:label[@qualifier='MetricLoValue']" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select=".//j:label[@qualifier='MetricUOM']" />
      <xsl:text>&#160;</xsl:text>


      <xsl:variable name="toDate" select="substring(.//j:label[@qualifier='toDate'],8,4)" />
      <xsl:variable name="fromSDate" select="substring(.//j:label[@qualifier='fromDate'],8,4)" />


      <!--
		<xsl:choose>
			<xsl:when test=".//j:label[@qualifier='qualification'] !=''">
				<xsl:text>(</xsl:text><xsl:value-of select=".//j:label[@qualifier='qualification']" /><xsl:text>, </xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>(</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	-->
      <xsl:text>(</xsl:text>
      <xsl:choose>
        <xsl:when test="$fromSDate = $toDate">

          <xsl:value-of select="$fromSDate" />
          <xsl:text>)</xsl:text>
        </xsl:when>

        <xsl:when test="$toDate=''">


          <xsl:value-of select="$fromSDate" />
          <xsl:text>)</xsl:text>
        </xsl:when>

        <xsl:otherwise>


          <xsl:value-of select="$fromSDate" />
          <xsl:text>/</xsl:text>
          <xsl:value-of select="substring($toDate,3,2)" />
          <xsl:text>)</xsl:text>

        </xsl:otherwise>
      </xsl:choose>

      <xsl:if test=".//j:label[@qualifier='qualification'] !=''">
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select=".//j:label[@qualifier='qualification']" />
      </xsl:if>


    </xsl:for-each>



  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->


  <xsl:template match="j:dataGroup[@qualifier='keyPersonnel']">
    <p>
      <b>Key Personnel</b>
    </p>

    <xsl:for-each select="./j:keyPersonnel">
      <xsl:call-template name="keyPersonnel" />
    </xsl:for-each>
    
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="keyPersonnel">
      <xsl:choose>
      <xsl:when test="j:para">
        <xsl:call-template name="KP_with_comms" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="KP_no_comms" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <!-- ******************************************** -->

  <xsl:template name="KP_with_comms">

    <xsl:variable name="Job_Title" select="./j:doubleList[@qualifier='person']//j:label[@qualifier='jobTitle']" />
    <xsl:variable name="Per_Title" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='title']" />
    <xsl:variable name="Fir_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='firstName']" />
    <xsl:variable name="Mid_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='middleName']" />
    <xsl:variable name="Sur_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='surname']" />
    <xsl:variable name="Suffix" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='suffix']" />

    <p>
      <i>
        <xsl:value-of select="$Job_Title" />:
      </i>
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Per_Title" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Fir_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Mid_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Sur_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Suffix" />
      <xsl:text>&#160;</xsl:text>
    </p>

    <xsl:for-each select="j:para">
        <xsl:call-template name="KP.build.comms" />
    </xsl:for-each>

  </xsl:template>


  <!-- ******************************************** -->

  <xsl:template name="KP_no_comms">

    <xsl:variable name="Job_Title" select="./j:doubleList[@qualifier='person']//j:label[@qualifier='jobTitle']" />
    <xsl:variable name="Per_Title" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='title']" />
    <xsl:variable name="Fir_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='firstName']" />
    <xsl:variable name="Mid_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='middleName']" />
    <xsl:variable name="Sur_Name" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='surname']" />
    <xsl:variable name="Suffix" select="./j:doubleList[@qualifier='person']/j:second//j:label[@qualifier='suffix']" />

    <p>
      <i>
        <xsl:value-of select="$Job_Title" />:
      </i>
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Per_Title" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Fir_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Mid_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Sur_Name" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select="$Suffix" />
      <xsl:text>&#160;</xsl:text>
    </p>
  </xsl:template>
  <!-- ******************************************** -->


  <xsl:template name="KP.build.comms">
    <xsl:if test="@qualifier='Telephone'">
      <p>
        <i>
          <xsl:text>Tel: </xsl:text>
        </i></p>
      <p>
        <xsl:call-template name="createPerTelephone" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='Mobile'">
      <p>
      <i>
        <xsl:text>Mobile: </xsl:text>
      </i>
      <xsl:call-template name="createPerTelephone" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='Cable'">
      <p>
      <i>
        <xsl:text>Cable: </xsl:text>
      </i>
      <xsl:call-template name="createPerTelephone" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='Telex'">
      <p>
      <i>
        <xsl:text>Telex: </xsl:text>
      </i>
      <xsl:call-template name="createPerTelephone" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='Fax'">
      <p>
      <i>
        <xsl:text>Fax: </xsl:text>
      </i>
      <xsl:call-template name="createPerTelephone" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='e-mail'">
      <p>
      <i>
        <xsl:text>e-mail: </xsl:text>
      </i>
      <xsl:call-template name="createPerOrgCode" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='Web'">
      <p>
      <i>
        <xsl:text>Web: </xsl:text>
      </i>
      <xsl:call-template name="createKPWebCode" />
      </p>
    </xsl:if>
    <xsl:if test="@qualifier='FTP'">
      <p>
      <i>
        <xsl:text>FTP: </xsl:text>
      </i>
      <xsl:call-template name="createPerOrgCode" />
</p>
    </xsl:if>
    <xsl:if test="@qualifier='CompuServe'">
      <p>
      <i>
        <xsl:text>CompuServe: </xsl:text>
      </i>
      <xsl:call-template name="createPerOrgCode" />
      </p>
    </xsl:if>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="createPerTelephone">

    <xsl:text>(+</xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='intlCode']"/>
    <xsl:text>&#160;</xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='areaCode']"/>
    <xsl:text>) </xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='value']"/>
    <xsl:value-of select="$n"/>
    <xsl:choose>
      <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>(</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='qualification']"/>
        <xsl:text>)</xsl:text>
        <xsl:value-of select="$n"/>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>

  </xsl:template>
  <!-- ******************************************** -->
  <xsl:template name="createPerOrgCode">

    <xsl:value-of select="./janes:label[@qualifier='value']"/>
    <xsl:value-of select="$n"/>
    <xsl:choose>
      <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>(</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='qualification']"/>
        <xsl:text>)</xsl:text>
        <xsl:value-of select="$n"/>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>
  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='AE - Aircraft Fleet']">
    <p>
      <b>Fixed-Wing Fleet: </b>
    </p>
    <xsl:for-each select="./j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='HE - Helicopter Fleet']">
    <p>
      <b>Rotary-Wing Fleet: </b>
    </p>
    <xsl:for-each select="./j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="j:dataGroup[@qualifier='Description']">
    <p>
      <b>Activities/Services: </b>
    </p>
    <xsl:for-each select="./j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- * prodService ************************************************************************************************************************************************************************************* -->
  <xsl:template match="j:dataGroup[@qualifier='prodService']">
    <p>
      <b>Products/Services: </b>
    </p>
    <xsl:for-each select="./j:para">
      <p>
        <xsl:value-of select="./j:label[@qualifier='name']" />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- * Accreditations ************************************************************************************************************************************************************************************* -->
  <xsl:template match="j:dataGroup[@qualifier='Accreditations']">
    <p>
      <b>
        <xsl:text>Accreditations: </xsl:text>
      </b>
      <xsl:value-of select="." />
    </p>
  </xsl:template>

  <!-- * Financial ************************************************************************************************************************************************************************************* -->
  <xsl:template match="j:dataGroup[@qualifier='Financial']">

    <xsl:if test="preceding-sibling::j:dataGroup[1][@qualifier!='Financial']">
      <p>
        <b>
          <xsl:text>Financial: </xsl:text>
        </b>
      </p>
    </xsl:if>

    <xsl:if test="j:title/text()!=''">
      <p>
        <i>
          <xsl:value-of select="j:title" />
        </i>
      </p>
    </xsl:if>

    <xsl:for-each select="j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- * Subsidiaries ***************************** -->
  <xsl:template match="j:dataGroup[@qualifier='Subsidiaries']">
    <p>
      <b>
        <xsl:value-of select="j:title" />
      </b>
    </p>
    <xsl:for-each select="j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- * Publications ***************************** -->
  <xsl:template match="j:dataGroup[@qualifier='Publications']">
    <p>
      <b>
        <xsl:text>Publications: </xsl:text>
      </b>
    </p>
    <xsl:variable name="countPubs" select="count(j:para)" />

    <xsl:choose>
      <xsl:when test="$countPubs=1">
        <p>
          <xsl:value-of select="." />
        </p>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="j:para">
          <p>
            <xsl:value-of select="." />
          </p>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- * Representing ***************************** -->
  <xsl:template match="j:dataGroup[@qualifier='Representing']">
    <p>
      <b>
        <xsl:text>Representing: </xsl:text>
      </b>
    </p>
    <xsl:for-each select="j:para">
      <p>
        <xsl:value-of select="." />
      </p>
    </xsl:for-each>
  </xsl:template>

  <!-- * Company registration number ***************************** -->
  <xsl:template match="j:para[@qualifier='Company Registration Number']">
    <p>
      <b>
        <xsl:text>Company Registration Number: </xsl:text>
      </b>
      <xsl:value-of select="." />
    </p>
  </xsl:template>

  <!-- * VAT registration number ***************************** -->
  <xsl:template match="j:para[@qualifier='VAT Registration Number']">
    <p>
      <b>
        <xsl:text>VAT Registration Number: </xsl:text>
      </b>
      <xsl:value-of select="." />
    </p>
  </xsl:template>



  <!-- ******************************************************************************************* -->
  <xsl:template match="j:dataGroup[@qualifier='orgRelation']">
    <br/>
    <xsl:variable name="decide_org_Type" select="./j:para[1]/@qualifier" />
    <xsl:variable name="count_paras" select="count(./j:para)" />

    <xsl:choose>
      <xsl:when test="$decide_org_Type ='subsidiary'">

        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <p>
              <b>Subsidiary/Affiliate: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <p>
              <b>Subsidiaries/Affiliates: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$decide_org_Type ='subordinate'">

        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <p>
              <b>Subordinate unit: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <p>
              <b>Subordinate units: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$decide_org_Type ='parent-subsidiary'">

        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <p>
              <b>Subsidiary/Affiliate of: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <p>
              <b>Subordinate units of: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:when test="$decide_org_Type ='parent-subordinate'">


        <xsl:choose>

          <xsl:when test="$count_paras =1">
            <p>
              <b>Subordinate unit of: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>

          <xsl:otherwise>
            <p>
              <b>Subsidiaries/Affiliates of: </b>
            </p>
            <xsl:for-each select="./j:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>

        <!-- <xsl:for-each select="./j:para">
				<xsl:call-template name="organisationRel" />
			</xsl:for-each> -->
      </xsl:when>

      <xsl:otherwise />
    </xsl:choose>





  </xsl:template>

  <!-- ****************************** -->
  <xsl:template name="organisationRel">

    <xsl:choose>
      <xsl:when test="j:label[@qualifier='orgName']/j:link">

        <xsl:variable name="org_Type" select="@qualifier" />
        <xsl:variable name="orgId" select="format-number(j:label[@qualifier='orgName']/j:link/@xlink:href, '00000000')" />
        <xsl:variable name="orgName" select="j:label[@qualifier='orgName']/j:link/j:linkText" />
        <xsl:variable name="divName" select="j:label[@qualifier='divName']" />
        <xsl:variable name="city" select="j:label[@qualifier='city']" />
        <xsl:variable name="country" select="j:label[@qualifier='country']" />
        <xsl:variable name="fromDate" select="j:label[@qualifier='fromDate']" />
        <xsl:variable name="countorgRel" select="count(ancestor::j:record//j:dataGroup[@qualifier='orgRelation'])" />

        <!--<a href="{$orgId}.htm" target="new">-->
        <a href="{$orgId}.htm">
          <xsl:if test="$orgName !=''">
            <xsl:value-of select="$orgName"/>
          </xsl:if>
          <xsl:if test="$divName !=''">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="$divName"/>
          </xsl:if>
          <xsl:if test="$country !=''">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="$country"/>
          </xsl:if>

        </a>
        <br/>
      </xsl:when>
      <xsl:otherwise>

        <xsl:variable name="org_Type" select="@qualifier" />
        <xsl:variable name="orgId" select="format-number(j:label[@qualifier='orgId'], '00000000')" />
        <xsl:variable name="orgName" select="j:label[@qualifier='orgName']" />
        <xsl:variable name="divName" select="j:label[@qualifier='divName']" />
        <xsl:variable name="city" select="j:label[@qualifier='city']" />
        <xsl:variable name="country" select="j:label[@qualifier='country']" />
        <xsl:variable name="fromDate" select="j:label[@qualifier='fromDate']" />
        <xsl:variable name="countorgRel" select="count(ancestor::j:record//j:dataGroup[@qualifier='orgRelation'])" />

        <xsl:if test="$orgName !=''">
          <xsl:value-of select="$orgName"/>
        </xsl:if>
        <xsl:if test="$divName !=''">
          <xsl:text>, </xsl:text>
          <xsl:value-of select="$divName"/>
        </xsl:if>
        <xsl:if test="$country !=''">
          <xsl:text>, </xsl:text>
          <xsl:value-of select="$country"/>
        </xsl:if>

        <br/>

      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- **  Pri_Sec_business_type **************************** -->

  <xsl:template name="Pri_Sec_business_type">
    <p>
      <b>Primary Business Type: </b>
      <xsl:value-of select=".//j:metadata/jm:organisation/jm:classification[@qualifier='primary']/jm:standardName"/>
    </p>

    <xsl:variable name="number_secondary" select="count(.//j:metadata/jm:organisation/jm:classification[@qualifier='secondary'])" />

    <xsl:choose>

      <xsl:when test="$number_secondary = 1">

    <p>
        <b>Secondary Business Type: </b>
        <xsl:value-of select=".//j:metadata/jm:organisation/jm:classification[@qualifier='secondary']/jm:standardName"/>
        </p>
      </xsl:when>
      <xsl:when test="$number_secondary > 1">
        <p>
          <b>Secondary Business Types: </b>
        </p>
        <xsl:for-each select=".//j:metadata/jm:organisation/jm:classification[@qualifier='secondary']">
          <p>
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="./jm:standardName"/>
          </p>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>

    <br/>
  </xsl:template>

  <xsl:template match="j:fleetList">

    <xsl:choose>
      <xsl:when test=".//j:shipInstance//j:shipName/j:Name[. != ''] or  .//j:shipInstance//j:shipNumber/j:pennant[. != '']">
        <table border="1">
          <tr>
            <xsl:for-each select="j:shipInstance[1]/*[@label and matches(@label, '[a-z]', 'i')]">

              <xsl:variable name="elementName" select="local-name()"/>

              <xsl:if test="ancestor::j:fleetList/j:shipInstance/*[local-name() = $elementName]//*[matches(., '[a-z0-9]', 'i') ]">
                <th bgcolor="#EBEDED">
                  <xsl:value-of select="@label"/>
                </th>
              </xsl:if>
            </xsl:for-each>
          </tr>
          <xsl:for-each select="j:shipInstance[.//j:shipName/j:Name[. != ''] or .//j:shipNumber/j:pennant[. != '']]">
            <tr>
              <xsl:for-each select="*[@label and matches(@label, '[a-z]', 'i')]">
                <xsl:variable name="elementName" select="local-name()"/>
                <xsl:if test="ancestor::j:fleetList/j:shipInstance/*[local-name() = $elementName]//*[matches(., '[a-z0-9]', 'i') ]">
                  <td>
                    <xsl:apply-templates select="."/>
                  </td>
                </xsl:if>
              </xsl:for-each>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:when>
      <xsl:otherwise>
        <p>This information is unavailable.</p>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>


  <xsl:template match="j:shipInstance/*">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- for (ex-ABC 123, ex-DEF 345)-->
  <xsl:template match="j:shipInstance//j:exShipName|j:shipInstance//j:exPennant">
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) != local-name())">
      <xsl:text> (</xsl:text>
    </xsl:if>
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) = local-name())">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:text>ex-</xsl:text>
    <xsl:apply-templates/>
    <xsl:if test="not(following-sibling::*) or (local-name(following-sibling::*[1]) != local-name())">
      <xsl:text>)</xsl:text>
    </xsl:if>
  </xsl:template>

  <!-- for (thing 1, thing 2)-->
  <xsl:template match="j:shipInstance//j:typeNo|j:shipInstance//j:shipNameAlias">
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) != local-name())">
      <xsl:text> (</xsl:text>
    </xsl:if>
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) = local-name())">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates/>
    <xsl:if test="not(following-sibling::*) or (local-name(following-sibling::*[1]) != local-name())">
      <xsl:text>)</xsl:text>
    </xsl:if>
  </xsl:template>

  <!-- for AA/PA, (Builder 1 group)/(Builder 2 group) -->
  <xsl:template match="j:shipInstance//j:builder|j:shipInstance//j:fs">
    <xsl:if test="position() &gt; 1">
      <xsl:text>/</xsl:text>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- For Builder Group = Name, Town. If no Name, do not put in comma-->
  <xsl:template match="j:shipInstance//j:builder/j:builderTown">
    <xsl:if test="preceding-sibling::*[1][local-name() = 'Name'][text() and not(text() = '')]">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Comma between seaport and admin area -->
  <xsl:template match="j:shipInstance//j:adminArea">
    <xsl:if test="preceding-sibling::*[1][local-name() = 'seaPort'][text() and not(text() = '')]">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Do not display these -->
  <xsl:template match="j:shipInstance//j:builderRegion|j:shipInstance//j:builderCountry|j:shipInstance//j:LRNO"/>

  <xsl:template match="j:shipInstance//j:outOfServiceReason">
    <xsl:text> (</xsl:text>
    <xsl:apply-templates/>
    <xsl:text>)</xsl:text>
  </xsl:template>

  <!-- Just apply templates -->
  <xsl:template match="j:shipInstance//j:Name|j:shipInstance//j:seaPort">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Transform dates (XSLT 1 compliant version -->

  <xsl:template name="monthtext">
    <xsl:param name="input"/>
    <xsl:choose>
      <xsl:when test="$input = 1">Jan</xsl:when>
      <xsl:when test="$input = 2">Feb</xsl:when>
      <xsl:when test="$input = 3">Mar</xsl:when>
      <xsl:when test="$input = 4">Apr</xsl:when>
      <xsl:when test="$input = 5">May</xsl:when>
      <xsl:when test="$input = 6">Jun</xsl:when>
      <xsl:when test="$input = 7">Jul</xsl:when>
      <xsl:when test="$input = 8">Aug</xsl:when>
      <xsl:when test="$input = 9">Sep</xsl:when>
      <xsl:when test="$input = 10">Oct</xsl:when>
      <xsl:when test="$input = 11">Nov</xsl:when>
      <xsl:when test="$input = 12">Dec</xsl:when>
    </xsl:choose>
  </xsl:template>


  <xsl:template match="j:shipInstance/*[j:day or j:month or j:year]" priority="2">

    <xsl:if test="number(j:day) &gt; 0 and number(j:day) &lt; 32">
      <xsl:value-of select="number(j:day)"/>
      <xsl:text>&#160;</xsl:text>
    </xsl:if>

    <xsl:if test="number(j:month) &gt; 0 and number(j:month) &lt; 13">
      <xsl:call-template name="monthtext">
        <xsl:with-param name="input">
          <xsl:value-of select="number(j:month)"/>
        </xsl:with-param>
      </xsl:call-template>
      <xsl:text>&#160;</xsl:text>
    </xsl:if>

    <xsl:if test="number(j:year) &gt; 1000">
      <xsl:value-of select="number(j:year)"/>
    </xsl:if>

    <xsl:apply-templates select="*[not(local-name() = 'day' or local-name() = 'month' or local-name() = 'year')]"/>
    
  </xsl:template>

  <!-- END OF JFS SPEC DATA SPECIFIC MATCHES. SOME MORE NAMED TEMPLATES LOWER DOWN -->

  <xsl:template match="j:table/j:title">
    <p>
      <xsl:apply-templates/>
    </p>
  </xsl:template>

  <!-- JFS Specific tables OBSOLETE -->
  <xsl:template match='j:table[@qualifier="fleetList"]'>
    <table border="1">
      <xsl:for-each select='j:tgroup/j:thead/j:row'>
        <tr>
          <xsl:for-each select='j:entry'>
            <xsl:call-template name="testRow">
              <xsl:with-param name="colnum" select="position()"/>
              <xsl:with-param name="cellType">th</xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </tr>
      </xsl:for-each>
      <xsl:for-each select='j:tgroup/j:tbody/j:row'>
        <tr>
          <xsl:for-each select='j:entry'>
            <xsl:call-template name="testRow">
              <xsl:with-param name="colnum" select="position()"/>
              <xsl:with-param name="cellType">td</xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </tr>
      </xsl:for-each>
    </table>

  </xsl:template>

  <!-- JFS specific template OBSOLETE -->
  <xsl:template name="testRow">
    <xsl:param name="colnum"/>
    <xsl:param name="cellType"/>
    <xsl:choose>
      <xsl:when test='../../../j:tbody/j:row/j:entry[$colnum]/j:para!=""'>
        <xsl:text disable-output-escaping="yes">&lt;</xsl:text><xsl:value-of select="$cellType"/><xsl:text disable-output-escaping="yes">&gt;</xsl:text>
        <xsl:value-of select="."/>
        <xsl:text disable-output-escaping="yes">&lt;</xsl:text>/<xsl:value-of select="$cellType"/><xsl:text disable-output-escaping="yes">&gt;</xsl:text>
      </xsl:when>
    </xsl:choose>

  </xsl:template>


  <xsl:template match="j:tgroup">
    <table>
      <xsl:choose>
        <!-- If there's a title, use that -->
        <xsl:when test="../title">
          <xsl:attribute name="summary">
            <xsl:value-of select="string(../title)"/>
          </xsl:attribute>
        </xsl:when>
        <!-- Else, forget the whole idea -->
        <xsl:otherwise>
          <!-- nevermind -->
        </xsl:otherwise>
      </xsl:choose>


      <xsl:choose>
        <xsl:when test="../@frame='none'">
          <xsl:attribute name="border">0</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="border">1</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>

      <xsl:apply-templates/>

      <xsl:if test=".//footnote">
        <tr>
          <td colspan="{@cols}">
            <xsl:apply-templates select=".//footnote"
                                  mode="table.footnote.mode"/>
          </td>
        </tr>
      </xsl:if>
    </table>
  </xsl:template>


  <!--
<xsl:template match="j:colspec">
    
    <xsl:value-of select="./@colwidth"/>
    
</xsl:template>
-->

  <xsl:template match="j:colspec"></xsl:template>

  <xsl:template match="j:spanspec"></xsl:template>

  <xsl:template match="j:thead|j:tfoot">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="j:tbody">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="j:row">
    <xsl:if test="@qualifier='jwafTableHeading2'">
      <tr>
        <td height='20'></td>
      </tr>
    </xsl:if>
    <tr>
      <xsl:if test="@align">
        <xsl:attribute name="align">
          <xsl:value-of select="@align"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@char">
        <xsl:attribute name="char">
          <xsl:value-of select="@char"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@charoff">
        <xsl:attribute name="charoff">
          <xsl:value-of select="@charoff"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="@valign">
          <xsl:attribute name="valign">
            <xsl:value-of select="@valign"/>
          </xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="valign">top</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates/>
    </tr>
  </xsl:template>

  <xsl:template match="j:thead/j:row/j:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">th</xsl:with-param>
      <xsl:with-param name="scope">col</xsl:with-param>
    </xsl:call-template>
  </xsl:template>


  <xsl:template match="j:tbody/j:row/j:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">td</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="j:tfoot/j:row/j:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">th</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="process.cell">
    <xsl:param name="cellgi">td</xsl:param>
    <xsl:param name="scope"></xsl:param>
    <xsl:variable name="empty.cell" select="count(node()) = 0"/>

    <xsl:variable name="entry.colnum">
      <xsl:call-template name="entry.colnum"/>
    </xsl:variable>

    <xsl:if test="$entry.colnum != ''">
      <xsl:call-template name="add-empty-entries">
        <xsl:with-param name="number"
             select="$entry.colnum - count(preceding-sibling::*) - 1"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:element name="{$cellgi}">
      <xsl:if test="@morerows">
        <xsl:attribute name="rowspan">
          <xsl:value-of select="@morerows+1"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@namest">
        <xsl:attribute name="colspan">
          <xsl:call-template name="calculate.colspan"/>
        </xsl:attribute>
      </xsl:if>
      <!-- Hacked by CJ 01-Mar-2005 -->
      <!-- To align all table cells left (probs with varying alignment -->

      <xsl:attribute name="align">
        <xsl:text>left</xsl:text>
      </xsl:attribute>

      <!--<xsl:attribute name="style">
        <xsl:text>margin-left: 60px</xsl:text>
      </xsl:attribute>-->
 
      
      
      <!-- /Hacked by CJ 01-Mar-2005 -->


      <xsl:if test="@charoff">
        <xsl:attribute name="charoff">
          <xsl:value-of select="@charoff"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@valign">
        <xsl:attribute name="valign">
          <xsl:value-of select="@valign"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$scope != ''">
        <xsl:if test=". != ''">
          <xsl:attribute name="scope">
            <xsl:value-of select="$scope"/>
          </xsl:attribute>
        </xsl:if>
      </xsl:if>
      
      <xsl:choose>
        <xsl:when test="$empty.cell">
          <xsl:text>&#160;</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <xsl:template name="add-empty-entries">
    <xsl:param name="number" select="'0'"/>
    <xsl:choose>
      <xsl:when test="$number &lt;= 0"></xsl:when>
      <xsl:otherwise>
        <td>&#160;</td>
        <xsl:call-template name="add-empty-entries">
          <xsl:with-param name="number" select="$number - 1"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <doc:template name="add-empty-entries" xmlns="">
    <refpurpose>Insert empty TDs into a table row</refpurpose>
    <refdescription>
      <para>This template inserts empty TDs into a table row.</para>
    </refdescription>
    <refparameter>
      <variablelist>
        <varlistentry>
          <term>number</term>
          <listitem>
            <para>The number of empty TDs to add.</para>
          </listitem>
        </varlistentry>
      </variablelist>
    </refparameter>
    <refreturn>
      <para>Nothing</para>
    </refreturn>
  </doc:template>

  <xsl:template name="entry.colnum">
    <xsl:param name="entry" select="."/>
    <xsl:choose>
      <xsl:when test="$entry/@colname">
        <xsl:variable name="colname" select="$entry/@colname"/>
        <xsl:variable name="colspec"
                      select="$entry/ancestor::tgroup/colspec[@colname=$colname]"/>
        <xsl:call-template name="colspec.colnum">
          <xsl:with-param name="colspecs" select="$colspec"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$entry/@namest">
        <xsl:variable name="namest" select="$entry/@namest"/>
        <xsl:variable name="colspec"
                      select="$entry/ancestor::tgroup/colspec[@colname=$namest]"/>
        <xsl:call-template name="colspec.colnum">
          <xsl:with-param name="colspecs" select="$colspec"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <doc:template name="entry.colnum" xmlns="">
    <refpurpose>Determine the column number in which a given entry occurs</refpurpose>
    <refdescription>
      <para>
        If an <sgmltag>entry</sgmltag> has a
        <sgmltag class="attribute">colname</sgmltag> or
        <sgmltag class="attribute">namest</sgmltag> attribute, this template
        will determine the number of the column in which the entry should occur.
        For other <sgmltag>entry</sgmltag>s, nothing is returned.
      </para>
    </refdescription>
    <refparameter>
      <variablelist>
        <varlistentry>
          <term>entry</term>
          <listitem>
            <para>
              The <sgmltag>entry</sgmltag>-element which is to be tested.
            </para>
          </listitem>
        </varlistentry>
      </variablelist>
    </refparameter>

    <refreturn>
      <para>
        This template returns the column number if it can be determined,
        or nothing (the empty string)
      </para>
    </refreturn>
  </doc:template>

  <xsl:template name="colspec.colnum">
    <!-- when this macro is called, the current context must be an entry -->
    <xsl:param name="colname"></xsl:param>
    <!-- .. = row, ../.. = thead|tbody, ../../.. = tgroup -->
    <xsl:param name="colspecs" select="../../../../j:tgroup/j:colspec"/>
    <xsl:param name="count">1</xsl:param>
    <xsl:param name="colnum">1</xsl:param>
    <xsl:choose>
      <xsl:when test="$count>count($colspecs)"></xsl:when>
      <xsl:otherwise>
        <xsl:variable name="colspec" select="$colspecs[$count=position()]"/>
        <!--
      <xsl:value-of select="$count"/>:
      <xsl:value-of select="$colspec/@colname"/>=
      <xsl:value-of select="$colnum"/>
-->
        <xsl:choose>
          <xsl:when test="$colspec/@colname=$colname">
            <xsl:choose>
              <xsl:when test="$colspec/@colnum">
                <xsl:value-of select="$colspec/@colnum"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$colnum"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="colspec.colnum">
              <xsl:with-param name="colname" select="$colname"/>
              <xsl:with-param name="colspecs" select="$colspecs"/>
              <xsl:with-param name="count" select="$count+1"/>
              <xsl:with-param name="colnum">
                <xsl:choose>
                  <xsl:when test="$colspec/@colnum">
                    <xsl:value-of select="$colspec/@colnum + 1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$colnum + 1"/>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="generate.colgroup">
    <xsl:param name="cols" select="1"/>
    <xsl:param name="count" select="1"/>
    <xsl:choose>
      <xsl:when test="$count>$cols"></xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="generate.col">
          <xsl:with-param name="countcol" select="$count"/>
        </xsl:call-template>
        <xsl:call-template name="generate.colgroup">
          <xsl:with-param name="cols" select="$cols"/>
          <xsl:with-param name="count" select="$count+1"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="generate.col">
    <xsl:param name="countcol">1</xsl:param>
    <xsl:param name="colspecs" select="./colspec"/>
    <xsl:param name="count">1</xsl:param>
    <xsl:param name="colnum">1</xsl:param>

    <xsl:choose>
      <xsl:when test="$count>count($colspecs)">
        <col/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="colspec" select="$colspecs[$count=position()]"/>
        <xsl:variable name="colspec.colnum">
          <xsl:choose>
            <xsl:when test="$colspec/@colnum">
              <xsl:value-of select="$colspec/@colnum"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$colnum"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:choose>
          <xsl:when test="$colspec.colnum=$countcol">
            <col>
              <xsl:if test="$colspec/@align">
                <xsl:attribute name="align">
                  <xsl:value-of select="$colspec/@align"/>
                </xsl:attribute>
              </xsl:if>
              <xsl:if test="$colspec/@char">
                <xsl:attribute name="char">
                  <xsl:value-of select="$colspec/@char"/>
                </xsl:attribute>
              </xsl:if>
              <xsl:if test="$colspec/@charoff">
                <xsl:attribute name="charoff">
                  <xsl:value-of select="$colspec/@charoff"/>
                </xsl:attribute>
              </xsl:if>
            </col>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="generate.col">
              <xsl:with-param name="countcol" select="$countcol"/>
              <xsl:with-param name="colspecs" select="$colspecs"/>
              <xsl:with-param name="count" select="$count+1"/>
              <xsl:with-param name="colnum">
                <xsl:choose>
                  <xsl:when test="$colspec/@colnum">
                    <xsl:value-of select="$colspec/@colnum + 1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$colnum + 1"/>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <xsl:template name="colspec.colwidth">
    <!-- when this macro is called, the current context must be an entry -->
    <xsl:param name="colname"></xsl:param>
    <!-- .. = row, ../.. = thead|tbody, ../../.. = tgroup -->
    <xsl:param name="colspecs" select="../../../../tgroup/colspec"/>
    <xsl:param name="count">1</xsl:param>
    <xsl:choose>
      <xsl:when test="$count>count($colspecs)"></xsl:when>
      <xsl:otherwise>
        <xsl:variable name="colspec" select="$colspecs[$count=position()]"/>
        <xsl:choose>
          <xsl:when test="$colspec/@colname=$colname">
            <xsl:value-of select="$colspec/@colwidth"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="colspec.colwidth">
              <xsl:with-param name="colname" select="$colname"/>
              <xsl:with-param name="colspecs" select="$colspecs"/>
              <xsl:with-param name="count" select="$count+1"/>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="calculate.colspan">
    <xsl:variable name="scol">
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colname" select="@namest"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ecol">
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colname" select="@nameend"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select="$ecol - $scol + 1"/>
    <!--<xsl:text>"$ecol - $scol + 1"</xsl:text>-->
  </xsl:template>

  <xsl:template name="monthabbrevfromnumber">

    <xsl:param name="monthNum" as="xs:integer"/>
    <xsl:choose>
      <xsl:when test="$monthNum = 1">
        <xsl:text>Jan</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 2">
        <xsl:text>Feb</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 3">
        <xsl:text>Mar</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 4">
        <xsl:text>Apr</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 5">
        <xsl:text>May</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 6">
        <xsl:text>Jun</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 7">
        <xsl:text>Jul</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 8">
        <xsl:text>Aug</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 9">
        <xsl:text>Sep</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 10">
        <xsl:text>Oct</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 11">
        <xsl:text>Nov</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = 12">
        <xsl:text>Dec</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$monthNum"/>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <xsl:template match="janes:authoredBy">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="janes:author">
    <span>
      <xsl:apply-templates select="janes:authorName"/>
      <i>
        <xsl:apply-templates select="janes:publication"/>
        <xsl:apply-templates select="janes:position"/>
        <xsl:apply-templates select="janes:groupName"/>
      </i>
      <xsl:apply-templates select="janes:site"/>
      <xsl:apply-templates select="janes:contact"/>
    </span>
  </xsl:template>

  <xsl:template match="janes:authorName">
    <xsl:if test="not(. = ('', ' '))">
      <b>
        <xsl:apply-templates/>
      </b>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:position">
    <xsl:if test="not(. = ('', ' '))">
      <xsl:text>&#160;</xsl:text>
      <xsl:apply-templates/>
      <!--    <xsl:if test="../janes:publication and not(../janes:publication = ('', ' ')) and not(matches(., ', *$'))"><xsl:text>,</xsl:text></xsl:if><xsl:text>&#160;</xsl:text> -->
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:groupName">
    <xsl:if test="not(. = ('', ' '))">
      <xsl:text>&#160;</xsl:text>
      <xsl:apply-templates/>
      <!--    <xsl:if test="((../janes:position and not(../janes:position = ('', ' '))) or (../janes:publication and not(../janes:publication = ('', ' ')))) and not(matches(., ', *$'))"><xsl:text>,</xsl:text></xsl:if><xsl:text>&#160;</xsl:text>-->
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:contact">
    <xsl:if test="not(. = ('', ' '))">
      <br/>
      <xsl:text>&#160;&#160;&#160;</xsl:text>
      <xsl:apply-templates/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:site">
    <xsl:if test="not(. = ('', ' '))">
      <xsl:text>,&#160;</xsl:text>
      <!-- <b> -->
      <xsl:apply-templates/>
      <!-- </b> -->
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:publication">
    <xsl:if test="not(. = ('', ' '))">
      <xsl:text>&#160;</xsl:text>
      <xsl:apply-templates/>
      <!--    <xsl:text>&#160;</xsl:text> -->
    </xsl:if>
  </xsl:template>


  <xsl:template match="janes:relatedInfo">
    <br/>
    <table border="1" width="100%">
      <xsl:choose>
        <xsl:when test="janes:title and not(janes:title = '')">

          <tr>
            <td bgcolor="#EBEBEB">
              <xsl:apply-templates select="janes:title"/>
            </td>
          </tr>
          <tr>
            <td>
              <xsl:apply-templates select="*[ not(name() = 'janes:title') ]"/>
            </td>
          </tr>
        </xsl:when>
        <xsl:otherwise>
          <tr>
            <td bgcolor="#EBEBEB">
              <h3>
                <xsl:value-of select="'Related Articles'"/>
              </h3>
            </td>
          </tr>
          <tr>
            <td>
              <xsl:apply-templates/>
            </td>
          </tr>
        </xsl:otherwise>
      </xsl:choose>
    </table>
  </xsl:template>


  <xsl:template match="janes:relatedArticle">
    <xsl:choose>
      <xsl:when test="local-name(..) = ('listItem', 'para')">
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
        <xsl:if test="following-sibling::*">
          <br/>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template name="image">
    <xsl:variable name="type">
      <xsl:choose>
        <xsl:when test="$typeflag = 'Images'">
          <xsl:text>p</xsl:text>
        </xsl:when>
        <xsl:when test="not($typeflag = 'News' or $typeflag = 'JAHA')"/>
        <xsl:when test="j:mediaObject/@imageType='picture'">
          <xsl:text>p</xsl:text>
        </xsl:when>
        <xsl:when test="j:mediaObject/@imageType='graphic'">
          <xsl:text>g</xsl:text>
        </xsl:when>
        <xsl:when test="j:mediaObject/@imageType='lineDrawing'">
          <xsl:text>l</xsl:text>
        </xsl:when>
        <xsl:when test="j:mediaObject/@imageType='map'">
          <xsl:text>m</xsl:text>
        </xsl:when>
        <xsl:when test="j:mediaObject/@imageType='satellite'">
          <xsl:text>x</xsl:text>
        </xsl:when>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="ext">
      <xsl:choose>
        <xsl:when test="j:mediaObject/@type='graphic'">
          <xsl:text>.jpg</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>.mpg</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <img alt="{janes:caption}" align="center">

      <xsl:if test="j:mediaObject/@imageType='satellite'">
      	<xsl:attribute name="width">600</xsl:attribute>
      </xsl:if>      
      
      <xsl:attribute name="src">
        <xsl:value-of select="concat($imagebs, $type, j:mediaObject/@vurl, $ext)"/>
      </xsl:attribute>
    </img>

  </xsl:template>



</xsl:stylesheet>